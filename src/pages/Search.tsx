import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Users, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-safe">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Search Results</h1>
        <p className="text-muted-foreground mt-1">
          Showing results for <span className="font-semibold text-foreground">"{query}"</span>
        </p>
      </div>

      <div className="space-y-6 mt-8">
        <Card className="border-border">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-lg flex items-center">
              <Users className="w-4 h-4 mr-2" /> Communities
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 text-center text-muted-foreground py-12">
            No communities matched your search.
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-lg flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" /> Messages
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 text-center text-muted-foreground py-12">
            Search backend is indexing. Please try again later.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
