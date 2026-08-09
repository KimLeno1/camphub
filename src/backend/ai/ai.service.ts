import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { GoogleGenAI, Type } from "@google/genai";
import { db } from '../../db';
import { resources, users, communities, communityMembers } from '../../db/schema';
import { eq, ne, and } from 'drizzle-orm';

@Injectable()
export class AiService {
  private getAiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new InternalServerErrorException('GEMINI_API_KEY environment variable is required');
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  // 1. Duplicate resource detection
  async detectDuplicateResource(title: string, mimeType: string, communityId: string) {
    try {
      const ai = this.getAiClient();
      
      // Fetch existing resources in this community to compare
      const existingResources = await db.select()
        .from(resources)
        .where(eq(resources.communityId, communityId));

      if (existingResources.length === 0) {
        return {
          isDuplicate: false,
          similarityScore: 0,
          duplicateOfResourceId: null,
          reason: "No existing resources in this community to compare against."
        };
      }

      const resourceList = existingResources.map(r => ({
        id: r.id,
        title: r.title,
        mimeType: r.mimeType
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Compare this new resource title: "${title}" (MIME: ${mimeType}) against these existing resources: ${JSON.stringify(resourceList)}.
        Determine if the new resource is a duplicate or extremely similar to any of the existing ones.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isDuplicate: { type: Type.BOOLEAN, description: "True if a duplicate or near-duplicate is found" },
              similarityScore: { type: Type.NUMBER, description: "Similarity score of the closest match, from 0 to 1" },
              duplicateOfResourceId: { type: Type.STRING, description: "ID of the duplicate resource, or null if not a duplicate" },
              reason: { type: Type.STRING, description: "Explanation of why it is or is not a duplicate" }
            },
            required: ["isDuplicate", "similarityScore", "reason"]
          }
        }
      });

      const resultText = response.text || "{}";
      return JSON.parse(resultText.trim());
    } catch (error) {
      console.error('Duplicate detection failed:', error);
      throw new InternalServerErrorException('Failed to perform duplicate resource detection');
    }
  }

  // 2. Spam detection
  async detectSpam(content: string) {
    try {
      const ai = this.getAiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Analyze the following student forum message content and check if it is spam, commercial self-promotion, phishing, or irrelevant junk:
        "${content}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isSpam: { type: Type.BOOLEAN },
              confidence: { type: Type.NUMBER, description: "Confidence score from 0 to 1" },
              reason: { type: Type.STRING, description: "Brief analysis explanation" }
            },
            required: ["isSpam", "confidence", "reason"]
          }
        }
      });

      return JSON.parse((response.text || "{}").trim());
    } catch (error) {
      console.error('Spam detection failed:', error);
      throw new InternalServerErrorException('Failed to analyze content for spam');
    }
  }

  // 3. Toxicity detection
  async detectToxicity(content: string) {
    try {
      const ai = this.getAiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Analyze the following post/message for toxic content, cyberbullying, hate speech, severe harassment, or explicit vulgarity:
        "${content}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isToxic: { type: Type.BOOLEAN },
              score: { type: Type.NUMBER, description: "Toxicity score from 0 to 1" },
              category: { type: Type.STRING, description: "Classification: Hate speech, Harassment, Sexual, Vulgar, or None" },
              reason: { type: Type.STRING, description: "Reasoning for the safety decision" }
            },
            required: ["isToxic", "score", "category", "reason"]
          }
        }
      });

      return JSON.parse((response.text || "{}").trim());
    } catch (error) {
      console.error('Toxicity detection failed:', error);
      throw new InternalServerErrorException('Failed to analyze content for toxicity');
    }
  }

  // 4. Opportunity recommendation
  async recommendOpportunities(uid: string) {
    try {
      const ai = this.getAiClient();
      
      const userResult = await db.select().from(users).where(eq(users.uid, uid));
      if (!userResult.length) throw new NotFoundException('User not found');
      const user = userResult[0];

      const userProfileText = `Major: ${user.major || 'Computer Science/Undecided'}. Trust level: ${user.trustLevel}. Display Name: ${user.displayName}.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Based on this student profile:
        ${userProfileText}
        Provide 4 highly customized recommendations for internships, academic research opportunities, hackathons, fellowships, or study scholarships. Make them realistic and directly beneficial for their major.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Title of the opportunity" },
                type: { type: Type.STRING, description: "Internship, Scholarship, Research, or Hackathon" },
                description: { type: Type.STRING, description: "Clear explanation of the opportunity" },
                deadline: { type: Type.STRING, description: "Estimated or direct application timeline" },
                fitReason: { type: Type.STRING, description: "Personalized reason why this fits the student's major and goals" }
              },
              required: ["title", "type", "description", "fitReason"]
            }
          }
        }
      });

      return JSON.parse((response.text || "[]").trim());
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('Opportunity recommendations failed:', error);
      throw new InternalServerErrorException('Failed to compile opportunity recommendations');
    }
  }

  // 5. Club recommendation
  async recommendClubs(uid: string) {
    try {
      const ai = this.getAiClient();
      
      const userResult = await db.select().from(users).where(eq(users.uid, uid));
      if (!userResult.length) throw new NotFoundException('User not found');
      const user = userResult[0];

      // Fetch all communities representing clubs/groups
      const allCommunities = await db.select().from(communities);
      const communityList = allCommunities.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description || ""
      }));

      const userProfileText = `Major: ${user.major || 'Undecided'}. Interested in connecting with peers.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Based on student profile: ${userProfileText}, rank and recommend the best matched communities from this list:
        ${JSON.stringify(communityList)}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                communityId: { type: Type.STRING },
                name: { type: Type.STRING },
                matchScore: { type: Type.NUMBER, description: "Match percentage from 0 to 100" },
                matchReason: { type: Type.STRING, description: "Personalized explanation of why this club fits them" }
              },
              required: ["communityId", "name", "matchScore", "matchReason"]
            }
          }
        }
      });

      return JSON.parse((response.text || "[]").trim());
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('Club recommendations failed:', error);
      throw new InternalServerErrorException('Failed to match community clubs');
    }
  }

  // 6. Study partner recommendation
  async recommendStudyPartners(uid: string) {
    try {
      const ai = this.getAiClient();
      
      const userResult = await db.select().from(users).where(eq(users.uid, uid));
      if (!userResult.length) throw new NotFoundException('User not found');
      const user = userResult[0];

      // Get other active students
      const potentialPartners = await db.select()
        .from(users)
        .where(ne(users.uid, uid));

      const selfProfile = {
        displayName: user.displayName,
        major: user.major || 'Computer Science'
      };

      const candidates = potentialPartners.map(p => ({
        id: p.id,
        displayName: p.displayName,
        major: p.major || 'Undecided',
        avatarUrl: p.avatarUrl
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Match compatible study partners for ${JSON.stringify(selfProfile)} from this list of candidates:
        ${JSON.stringify(candidates)}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                userId: { type: Type.STRING },
                displayName: { type: Type.STRING },
                avatarUrl: { type: Type.STRING },
                major: { type: Type.STRING },
                matchScore: { type: Type.NUMBER, description: "Compatibility score from 0 to 100" },
                matchReason: { type: Type.STRING, description: "Justification of academic overlap or mutual benefit" }
              },
              required: ["userId", "displayName", "matchScore", "matchReason"]
            }
          }
        }
      });

      return JSON.parse((response.text || "[]").trim());
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('Study partner matching failed:', error);
      throw new InternalServerErrorException('Failed to calculate study partner matches');
    }
  }

  // 7. Auto summarization
  async summarize(content: string, type: 'bullet' | 'short' | 'detailed' = 'bullet') {
    try {
      const ai = this.getAiClient();
      const prompt = `Summarize the following text using a format style of "${type}":
      "${content}"`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING, description: "Main concise summary overview" },
              bullets: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key itemized points" },
              keyTakeaways: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Direct conceptual takeaways" }
            },
            required: ["summary", "bullets", "keyTakeaways"]
          }
        }
      });

      return JSON.parse((response.text || "{}").trim());
    } catch (error) {
      console.error('Summarization failed:', error);
      throw new InternalServerErrorException('Failed to summarize content');
    }
  }

  // 8. Translation
  async translate(text: string, targetLanguage: string) {
    try {
      const ai = this.getAiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Translate the following text into ${targetLanguage}:
        "${text}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              translatedText: { type: Type.STRING, description: "Fully translated text" },
              detectedLanguage: { type: Type.STRING, description: "ISO code or full name of the source language" }
            },
            required: ["translatedText", "detectedLanguage"]
          }
        }
      });

      return JSON.parse((response.text || "{}").trim());
    } catch (error) {
      console.error('Translation failed:', error);
      throw new InternalServerErrorException('Failed to translate content');
    }
  }

  // 9. Question answering (AI Study Assistant)
  async askStudyAssistant(question: string, context?: string) {
    try {
      const ai = this.getAiClient();
      let contents = `Question: "${question}"`;
      if (context) {
        contents += `\nStudy Context: "${context}"`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents,
        config: {
          systemInstruction: "You are the Center7 AI Study Assistant. Provide highly educational, clean, clear, and comprehensive markdown answers with equations or code snippets where appropriate. Also suggest exactly three helpful, engaging follow-up questions.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              answer: { type: Type.STRING, description: "The beautiful markdown-supported educational answer" },
              followUps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Exactly three suggested follow-up questions" }
            },
            required: ["answer", "followUps"]
          }
        }
      });

      return JSON.parse((response.text || "{}").trim());
    } catch (error) {
      console.error('AI Q&A failed:', error);
      throw new InternalServerErrorException('Failed to process study question');
    }
  }

  // 10. Semantic search
  async semanticSearch(query: string) {
    try {
      const ai = this.getAiClient();
      
      // Fetch communities and resources to search over
      const allComms = await db.select().from(communities);
      const allRes = await db.select().from(resources);

      const searchItems = [
        ...allComms.map(c => ({ id: c.id, title: c.name, description: c.description || "", type: "community" })),
        ...allRes.map(r => ({ id: r.id, title: r.title, description: `File type: ${r.mimeType}`, type: "resource" }))
      ];

      if (searchItems.length === 0) {
        return [];
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `We have the following list of communities and files (resources):
        ${JSON.stringify(searchItems)}
        
        Evaluate each item based on semantic relevancy to the query: "${query}".
        Rank them and return items that match or align semantically.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                itemId: { type: Type.STRING },
                title: { type: Type.STRING },
                type: { type: Type.STRING, description: "community or resource" },
                relevanceScore: { type: Type.NUMBER, description: "Match relevancy score from 0 to 1" },
                matchExplanation: { type: Type.STRING, description: "How this item matches the search intent" }
              },
              required: ["itemId", "title", "type", "relevanceScore", "matchExplanation"]
            }
          }
        }
      });

      return JSON.parse((response.text || "[]").trim());
    } catch (error) {
      console.error('Semantic search failed:', error);
      throw new InternalServerErrorException('Failed to execute semantic search');
    }
  }
}
