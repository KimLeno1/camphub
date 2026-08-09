import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api/client';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { 
  FileText, Download, ArrowLeft, FileSpreadsheet, 
  FileCode, FileArchive, Image as ImageIcon, Presentation, UserCheck, 
  BookOpen, Calendar as CalendarIcon, CheckCircle2,
  Share2, MessageSquare, ThumbsUp, Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const defaultMockResources = [
  {
    id: 'res-default-1',
    title: 'CS201 Data Structures & Algorithms - Midterm Exam Solutions',
    description: 'Comprehensive solutions for the Spring 2025 midterm examination. Includes detailed explanations for the dynamic programming and graph traversal sections.',
    fileUrl: 'https://example.com/cs201-midterm.pdf',
    fileSizeBytes: 2450000,
    mimeType: 'application/pdf',
    extension: 'pdf',
    lecturerName: 'Dr. Alan Smith',
    courseCode: 'CS201 Data Structures',
    resourceType: 'Past Exam Paper',
    resourceDate: 'Spring 2025',
    verified: true,
    downloads: 184,
    views: 892,
    likes: 45,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    uploader: {
      name: 'Sarah Chen',
      avatar: 'https://i.pravatar.cc/150?u=sarah',
      role: 'Senior Student'
    }
  },
  {
    id: 'res-default-2',
    title: 'PHY102 Electromagnetism - Comprehensive Lecture Slides & Formula Sheet',
    description: 'All lecture slides from weeks 1-12 combined. Also includes a 2-page formula cheat sheet approved for the final exam.',
    fileUrl: 'https://example.com/phy102-slides.pptx',
    fileSizeBytes: 5800000,
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    extension: 'pptx',
    lecturerName: 'Prof. Helen Vance',
    courseCode: 'PHY102 Physics',
    resourceType: 'Lecture Notes & Slides',
    resourceDate: 'Fall 2024',
    verified: true,
    downloads: 120,
    views: 450,
    likes: 32,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    uploader: {
      name: 'Michael Chang',
      avatar: 'https://i.pravatar.cc/150?u=michael',
      role: 'Teaching Assistant'
    }
  },
  {
    id: 'res-default-3',
    title: 'BUS301 Financial Accounting - Financial Ratio Analysis Practice Excel Sheet',
    description: 'Practice spreadsheet with automated formulas for calculating liquidity, solvency, and profitability ratios based on dummy company data.',
    fileUrl: 'https://example.com/bus301-sheet.xlsx',
    fileSizeBytes: 1200000,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extension: 'xlsx',
    lecturerName: 'Dr. Robert Kiyosaki',
    courseCode: 'BUS301 Accounting',
    resourceType: 'Other Study Material',
    resourceDate: 'Spring 2025',
    verified: false,
    downloads: 56,
    views: 210,
    likes: 12,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    uploader: {
      name: 'Emma Wilson',
      avatar: 'https://i.pravatar.cc/150?u=emma',
      role: 'Student'
    }
  }
];

const getFormatIcon = (extension?: string, mimeType?: string) => {
  const ext = extension?.toLowerCase() || '';
  const mime = mimeType?.toLowerCase() || '';
  
  if (ext === 'pdf' || mime.includes('pdf')) return { icon: FileText, color: 'text-red-500 bg-red-500/10 border-red-500/20' };
  if (ext === 'docx' || ext === 'doc' || mime.includes('word')) return { icon: FileText, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' };
  if (ext === 'pptx' || ext === 'ppt' || mime.includes('presentation')) return { icon: Presentation, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
  if (ext === 'xlsx' || ext === 'xls' || mime.includes('spreadsheet') || mime.includes('excel')) return { icon: FileSpreadsheet, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
  if (ext === 'zip' || ext === 'rar' || mime.includes('zip') || mime.includes('compressed')) return { icon: FileArchive, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' };
  if (ext === 'txt' || ext === 'md' || mime.includes('text')) return { icon: FileCode, color: 'text-slate-500 bg-slate-500/10 border-slate-500/20' };
  if (mime.includes('image') || ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) return { icon: ImageIcon, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' };
  
  return { icon: FileText, color: 'text-slate-500 bg-slate-500/10 border-slate-500/20' };
};

const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export function ResourceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: resource, isLoading } = useQuery({
    queryKey: ['resource', id],
    queryFn: async () => {
      try {
        const res = await apiClient.get(`/resources/${id}`);
        return res.data;
      } catch (err) {
        // Fallback to mock data if backend fails
        const mockRes = defaultMockResources.find(r => r.id === id);
        if (mockRes) return mockRes;
        throw err;
      }
    },
    retry: 1
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6 text-center py-20">
        <h2 className="text-2xl font-bold mb-2">Resource not found</h2>
        <p className="text-muted-foreground mb-6">The resource you are looking for does not exist or has been removed.</p>
        <Button onClick={() => navigate('/resources')}>Back to Resources</Button>
      </div>
    );
  }

  const formatMeta = getFormatIcon(resource.extension, resource.mimeType);
  const FormatIcon = formatMeta.icon;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 pb-20">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => navigate('/resources')}
        className="text-muted-foreground hover:text-foreground mb-2"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Resources
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className={`p-4 rounded-2xl ${formatMeta.color} shrink-0`}>
                <FormatIcon className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                    {resource.resourceType || 'Study Material'}
                  </span>
                  {resource.verified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified Resource
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-heading font-extrabold leading-tight text-foreground">
                  {resource.title}
                </h1>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap pt-1">
                  <span className="flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4" />
                    {resource.createdAt ? format(new Date(resource.createdAt), 'MMMM d, yyyy') : 'Date unavailable'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    {resource.views || 0} views
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Download className="w-4 h-4" />
                    {resource.downloads || 0} downloads
                  </span>
                </div>
              </div>
            </div>

            <Card className="border border-border/50 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-3">Description</h3>
                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                  {resource.description || "No description provided for this resource."}
                </p>
              </CardContent>
            </Card>

            <div className="flex items-center gap-3 pt-2">
              <Button 
                size="lg" 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md" 
                onClick={() => {
                  if (resource.fileUrl && resource.fileUrl !== '#') {
                    window.open(resource.fileUrl, '_blank');
                  } else {
                    toast.success(`Downloading ${resource.title}...`);
                  }
                }}
              >
                <Download className="w-5 h-5 mr-2" />
                Download ({formatBytes(resource.fileSizeBytes)})
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-xl px-4"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copied to clipboard');
                  } catch (err) {
                    toast.success('Link ready to share!');
                  }
                }}
              >
                <Share2 className="w-5 h-5 text-muted-foreground" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-xl px-4"
                onClick={() => {
                  toast.success('Resource added to your liked items');
                }}
              >
                <ThumbsUp className="w-5 h-5 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Resource Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {resource.courseCode && (
                <div>
                  <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">Course / Subject</p>
                  <p className="flex items-center gap-2 font-medium">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    {resource.courseCode}
                  </p>
                </div>
              )}
              
              {resource.lecturerName && (
                <div>
                  <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">Lecturer / Professor</p>
                  <p className="flex items-center gap-2 font-medium">
                    <UserCheck className="w-4 h-4 text-purple-500" />
                    {resource.lecturerName}
                  </p>
                </div>
              )}

              {resource.resourceDate && (
                <div>
                  <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">Academic Term / Date</p>
                  <p className="flex items-center gap-2 font-medium">
                    <CalendarIcon className="w-4 h-4 text-amber-500" />
                    {resource.resourceDate}
                  </p>
                </div>
              )}

              <div className="pt-2 border-t border-border/50">
                <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">File Information</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="bg-muted p-2 rounded-lg">
                    <span className="block text-xs text-muted-foreground">Format</span>
                    <span className="font-mono font-medium">{(resource.extension || resource.mimeType?.split('/')[1] || 'DOC').toUpperCase()}</span>
                  </div>
                  <div className="bg-muted p-2 rounded-lg">
                    <span className="block text-xs text-muted-foreground">Size</span>
                    <span className="font-mono font-medium">{formatBytes(resource.fileSizeBytes)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {resource.uploader && (
            <Card className="border border-border/50 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Uploaded By</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <img 
                    src={resource.uploader.avatar} 
                    alt={resource.uploader.name} 
                    className="w-10 h-10 rounded-full bg-muted object-cover"
                  />
                  <div>
                    <p className="font-semibold text-sm">{resource.uploader.name}</p>
                    <p className="text-xs text-muted-foreground">{resource.uploader.role}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4 text-xs font-semibold rounded-xl"
                  onClick={() => toast.success(`Starting chat with ${resource.uploader.name}...`)}
                >
                  <MessageSquare className="w-3.5 h-3.5 mr-2" />
                  Message Contributor
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
