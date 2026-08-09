import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, Tag, ShoppingBag, Plus } from 'lucide-react';

export function Marketplace() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-safe">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Marketplace</h1>
          <p className="text-muted-foreground mt-1">Buy, sell, and trade with your peers.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Listing
        </Button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <Button variant="secondary" className="rounded-full shrink-0">All Items</Button>
        <Button variant="outline" className="rounded-full shrink-0">Textbooks</Button>
        <Button variant="outline" className="rounded-full shrink-0">Electronics</Button>
        <Button variant="outline" className="rounded-full shrink-0">Housing</Button>
        <Button variant="outline" className="rounded-full shrink-0">Services</Button>
      </div>

      <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border rounded-xl bg-muted/10">
        <ShoppingBag className="w-16 h-16 text-muted-foreground opacity-30 mb-4" />
        <h3 className="text-xl font-bold font-heading mb-2">Marketplace is coming soon</h3>
        <p className="text-muted-foreground max-w-md">
          A secure, escrow-based peer-to-peer trading platform integrated directly with your community reputation.
        </p>
      </div>
    </div>
  );
}
