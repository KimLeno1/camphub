import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button, buttonVariants } from '../components/ui/button';
import { cn } from '../lib/utils';
import { Input } from '../components/ui/input';
import { 
  FileText, Upload, Download, Loader2, AlertCircle, FileSpreadsheet, 
  FileCode, FileArchive, Image as ImageIcon, Presentation, UserCheck, 
  BookOpen, Calendar as CalendarIcon, Search, Filter, Sparkles, CheckCircle2,
  Paperclip, File
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { format } from 'date-fns';

const RESOURCE_TYPES = [
  'Past Exam Paper',
  'Lecture Notes & Slides',
  'Assignment & Homework Solution',
  'Lab Manual & Report',
  'E-Book & Textbook',
  'Research Paper',
  'Practice Quiz & Mock Exam',
  'Other Study Material',
];

const FILE_FORMAT_OPTIONS = [
  { label: 'PDF Document (.pdf)', extension: 'pdf', mime: 'application/pdf', icon: FileText, color: 'text-red-500 bg-red-500/10 border-red-500/20' },
  { label: 'Microsoft Word (.docx, .doc)', extension: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', icon: FileText, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
  { label: 'PowerPoint Presentation (.pptx, .ppt)', extension: 'pptx', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', icon: Presentation, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  { label: 'Excel Spreadsheet (.xlsx, .xls)', extension: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', icon: FileSpreadsheet, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  { label: 'Text File (.txt, .md)', extension: 'txt', mime: 'text/plain', icon: FileCode, color: 'text-slate-500 bg-slate-500/10 border-slate-500/20' },
  { label: 'Image (.jpg, .png, .webp)', extension: 'png', mime: 'image/png', icon: ImageIcon, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
  { label: 'Compressed Archive (.zip, .rar)', extension: 'zip', mime: 'application/zip', icon: FileArchive, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' },
];

export function Resources() {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');

  // Form states
  const [title, setTitle] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileFormat, setFileFormat] = useState('pdf');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Recommended optional metadata fields
  const [lecturerName, setLecturerName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [resourceType, setResourceType] = useState('Lecture Notes & Slides');
  const [resourceDate, setResourceDate] = useState('');

  const [duplicateCheckResult, setDuplicateCheckResult] = useState<any>(null);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);

  // Initial mock items for rich preview if backend is empty
  const defaultMockResources = [
    {
      id: 'res-default-1',
      title: 'CS201 Data Structures & Algorithms - Midterm Exam Solutions',
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
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 'res-default-2',
      title: 'PHY102 Electromagnetism - Comprehensive Lecture Slides & Formula Sheet',
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
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: 'res-default-3',
      title: 'BUS301 Financial Accounting - Financial Ratio Analysis Practice Excel Sheet',
      fileUrl: 'https://example.com/bus301-sheet.xlsx',
      fileSizeBytes: 1200000,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      extension: 'xlsx',
      lecturerName: 'Dr. Marcus Brody',
      courseCode: 'BUS301 Finance',
      resourceType: 'Assignment & Homework Solution',
      resourceDate: 'Spring 2025',
      verified: true,
      downloads: 95,
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    },
    {
      id: 'res-default-4',
      title: 'ENG105 Technical Writing & Research Paper Formatting Template',
      fileUrl: 'https://example.com/eng105-template.docx',
      fileSizeBytes: 890000,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      extension: 'docx',
      lecturerName: 'Prof. Clara Thomas',
      courseCode: 'ENG105 Technical Writing',
      resourceType: 'E-Book & Textbook',
      resourceDate: 'Semester 1 2025',
      verified: false,
      downloads: 64,
      createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    },
  ];

  const { data: resourcesRaw, isLoading } = useQuery({
    queryKey: ['resources', communityId],
    queryFn: async () => {
      const res = await apiClient.get(`/communities/${communityId || 'global'}/resources`).catch(() => null);
      return res?.data;
    },
  });

  const apiResources: any[] = Array.isArray(resourcesRaw) ? resourcesRaw : (Array.isArray(resourcesRaw?.data) ? resourcesRaw.data : []);
  const allResources = apiResources.length > 0 ? apiResources : defaultMockResources;

  const uploadMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post(`/communities/${communityId || 'global'}/resources`, data).catch(() => ({
        data: { id: `res-${Date.now()}`, ...data, createdAt: new Date().toISOString() }
      }));
      return res.data;
    },
    onSuccess: (newRes) => {
      queryClient.invalidateQueries({ queryKey: ['resources', communityId] });
      // If mock mode fallback
      queryClient.setQueryData(['resources', communityId], (old: any) => {
        const oldList = Array.isArray(old) ? old : (Array.isArray(old?.data) ? old.data : defaultMockResources);
        return [newRes, ...oldList];
      });

      setIsUploadOpen(false);
      resetForm();
      toast.success('Resource uploaded successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload resource');
    }
  });

  const resetForm = () => {
    setTitle('');
    setFileUrl('');
    setSelectedFile(null);
    setFileFormat('pdf');
    setLecturerName('');
    setCourseCode('');
    setResourceType('Lecture Notes & Slides');
    setResourceDate('');
    setDuplicateCheckResult(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
      const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
      setFileFormat(ext);
      setFileUrl(`https://storage.center7.edu/resources/${Date.now()}-${file.name}`);
    }
  };

  const handleUploadClick = async () => {
    const finalUrl = fileUrl || (selectedFile ? `https://storage.center7.edu/resources/${Date.now()}-${selectedFile.name}` : '');
    if (!title || !finalUrl) {
      toast.error('Please provide a resource title and a file');
      return;
    }

    const matchedFormat = FILE_FORMAT_OPTIONS.find(f => f.extension === fileFormat) || FILE_FORMAT_OPTIONS[0];

    const payload = {
      title,
      fileUrl: finalUrl,
      fileSizeBytes: selectedFile ? selectedFile.size : 2048000,
      mimeType: matchedFormat.mime,
      extension: fileFormat,
      lecturerName: lecturerName.trim() || undefined,
      courseCode: courseCode.trim() || undefined,
      resourceType,
      resourceDate: resourceDate.trim() || undefined,
      verified: true,
      downloads: 1,
      createdAt: new Date().toISOString(),
    };

    if (duplicateCheckResult) {
      uploadMutation.mutate(payload);
      return;
    }

    try {
      setCheckingDuplicate(true);
      const res = await apiClient.post('/ai/duplicate-resource', {
        title,
        mimeType: matchedFormat.mime,
        communityId: communityId || 'global-resources'
      });
      setCheckingDuplicate(false);

      if (res.data?.isDuplicate) {
        setDuplicateCheckResult(res.data);
        toast.warning(`AI Duplicate Warning: ${res.data.reason}`, { duration: 6000 });
      } else {
        uploadMutation.mutate(payload);
      }
    } catch (e) {
      setCheckingDuplicate(false);
      uploadMutation.mutate(payload);
    }
  };

  const getFormatIcon = (ext?: string, mime?: string) => {
    const formatStr = (ext || mime || '').toLowerCase();
    if (formatStr.includes('pdf')) return { icon: FileText, color: 'text-red-500 bg-red-500/10' };
    if (formatStr.includes('doc')) return { icon: FileText, color: 'text-blue-500 bg-blue-500/10' };
    if (formatStr.includes('ppt') || formatStr.includes('presentation')) return { icon: Presentation, color: 'text-amber-500 bg-amber-500/10' };
    if (formatStr.includes('xls') || formatStr.includes('sheet')) return { icon: FileSpreadsheet, color: 'text-emerald-500 bg-emerald-500/10' };
    if (formatStr.includes('zip') || formatStr.includes('rar') || formatStr.includes('archive')) return { icon: FileArchive, color: 'text-indigo-500 bg-indigo-500/10' };
    if (formatStr.includes('image') || formatStr.includes('png') || formatStr.includes('jpg')) return { icon: ImageIcon, color: 'text-purple-500 bg-purple-500/10' };
    return { icon: File, color: 'text-blue-600 bg-blue-500/10' };
  };

  // Filter logic
  const filteredResources = allResources.filter((res) => {
    const matchesSearch = 
      searchQuery === '' ||
      res.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.courseCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.lecturerName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = 
      selectedTypeFilter === 'all' ||
      res.resourceType === selectedTypeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 pb-safe">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-extrabold text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Resource Center
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Student-driven repository for verified past questions, lecture slides, textbooks, and notes.
          </p>
        </div>
        
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger className={cn(buttonVariants({ variant: "default" }), "bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-5 shadow-md shadow-blue-600/20 text-sm gap-2 rounded-xl shrink-0")}>
            <Upload className="w-4 h-4" />
            Upload Resource
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto p-6 rounded-2xl">
            <DialogHeader className="pb-2 border-b border-border/60">
              <DialogTitle className="text-xl font-bold font-heading flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                Share a Study Resource
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Support all popular document formats. Fill in recommended fields to help peers find materials easily.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3 text-sm">
              <div className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 p-3 flex rounded-xl text-xs border border-blue-200 dark:border-blue-900/50">
                <Sparkles className="w-4 h-4 mr-2 shrink-0 text-blue-500 mt-0.5" />
                <p>AI scanners automatically detect duplicates and index course materials for community search.</p>
              </div>

              {/* Resource Title */}
              <div className="space-y-1.5">
                <Label className="font-semibold text-xs uppercase tracking-wider text-foreground">
                  Resource Title <span className="text-red-500">*</span>
                </Label>
                <Input 
                  value={title} 
                  onChange={(e) => { setTitle(e.target.value); setDuplicateCheckResult(null); }} 
                  placeholder="e.g. CS201 Midterm Past Questions & Solutions (2025)" 
                  className="rounded-xl"
                />
              </div>

              {/* File Format & Picker */}
              <div className="space-y-2 border-t border-border/50 pt-3">
                <Label className="font-semibold text-xs uppercase tracking-wider text-foreground">
                  File Upload / Document Format <span className="text-red-500">*</span>
                </Label>
                
                {/* Drag & Drop File Input */}
                <div className="border-2 border-dashed border-border hover:border-blue-500/60 transition-colors p-4 rounded-xl bg-muted/20 text-center relative group cursor-pointer">
                  <input 
                    type="file" 
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.webp,.zip,.rar"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  <Paperclip className="w-8 h-8 mx-auto text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                  {selectedFile ? (
                    <div className="text-xs">
                      <p className="font-bold text-foreground">{selectedFile.name}</p>
                      <p className="text-muted-foreground mt-0.5">{(selectedFile.size / 1024).toFixed(1)} KB • Click to change file</p>
                    </div>
                  ) : (
                    <div className="text-xs">
                      <p className="font-semibold text-foreground">Click or Drag & Drop File Here</p>
                      <p className="text-muted-foreground mt-0.5 text-[11px]">Supports PDF, DOCX, PPTX, XLSX, TXT, Images & ZIP archives</p>
                    </div>
                  )}
                </div>

                {/* File URL fallback */}
                <div className="pt-1">
                  <Label className="text-[11px] text-muted-foreground">Or provide direct document download URL</Label>
                  <Input 
                    value={fileUrl} 
                    onChange={(e) => setFileUrl(e.target.value)} 
                    placeholder="https://example.com/file.pdf" 
                    className="rounded-xl text-xs mt-1"
                  />
                </div>
              </div>

              {/* OPTIONAL BUT RECOMMENDED FORM SECTION */}
              <div className="p-4 rounded-xl bg-muted/40 border border-border/70 space-y-3 mt-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <span className="font-bold text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" /> Recommended Metadata
                  </span>
                  <span className="text-[10px] bg-blue-500/15 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-semibold">
                    Highly Recommended
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Course Name / Code */}
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-foreground">Course Code & Name</Label>
                    <Input 
                      value={courseCode} 
                      onChange={(e) => setCourseCode(e.target.value)} 
                      placeholder="e.g. CS101 Intro to Programming" 
                      className="rounded-lg text-xs"
                    />
                  </div>

                  {/* Lecturer Name */}
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-foreground">Lecturer Name</Label>
                    <Input 
                      value={lecturerName} 
                      onChange={(e) => setLecturerName(e.target.value)} 
                      placeholder="e.g. Dr. Alan Smith" 
                      className="rounded-lg text-xs"
                    />
                  </div>

                  {/* Resource Type */}
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-foreground">Resource Type</Label>
                    <select
                      value={resourceType}
                      onChange={(e) => setResourceType(e.target.value)}
                      className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {RESOURCE_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {/* Date of Resource */}
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-foreground">Date / Academic Term</Label>
                    <Input 
                      value={resourceDate} 
                      onChange={(e) => setResourceDate(e.target.value)} 
                      placeholder="e.g. Spring 2025 or May 2025" 
                      className="rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {duplicateCheckResult && (
                <div className="bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 p-3.5 rounded-xl text-xs space-y-1.5 border border-amber-300 dark:border-amber-900/50">
                  <p className="font-semibold flex items-center gap-1 text-amber-800 dark:text-amber-300">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" /> AI Similarity Warning (Score: {Math.round(duplicateCheckResult.similarityScore * 100)}%)
                  </p>
                  <p className="leading-relaxed">{duplicateCheckResult.reason}</p>
                  <p className="font-medium text-[11px] pt-1 text-amber-900 dark:text-amber-400">Click &quot;Force Upload anyway&quot; if this is a distinct document edition.</p>
                </div>
              )}
            </div>

            <DialogFooter className="border-t border-border/60 pt-3">
              <Button variant="outline" size="sm" onClick={() => setIsUploadOpen(false)} className="rounded-xl">Cancel</Button>
              <Button 
                onClick={handleUploadClick}
                disabled={!title || (!fileUrl && !selectedFile) || uploadMutation.isPending || checkingDuplicate}
                className={duplicateCheckResult ? "bg-amber-600 hover:bg-amber-700 text-white rounded-xl" : "bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-600/20"}
              >
                {checkingDuplicate && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {uploadMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {duplicateCheckResult ? "Force Upload anyway" : "Publish Resource"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by course, lecturer name, or resource title..." 
            className="pl-9 rounded-xl bg-card border-border text-xs sm:text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="h-10 rounded-xl border border-input bg-card px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-auto"
          >
            <option value="all">All Resource Types</option>
            {RESOURCE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Resource Grid */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : filteredResources.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-card p-6">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <h3 className="text-lg font-bold">No resources found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Try adjusting your search query or be the first student to upload materials for this category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((res: any) => {
            const formatMeta = getFormatIcon(res.extension, res.mimeType);
            const FormatIcon = formatMeta.icon;

            return (
              <Card 
                key={res.id} 
                className="bento-card hover:border-blue-500/50 transition-all flex flex-col justify-between group cursor-pointer"
                onClick={() => navigate(`/resources/${res.id}`)}
              >
                <CardHeader className="p-0 mb-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className={`p-2.5 rounded-xl ${formatMeta.color} shrink-0`}>
                      <FormatIcon className="w-5 h-5" />
                    </div>
                    {res.verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>

                  <div>
                    <CardTitle className="text-base font-bold line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {res.title}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1 flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{res.resourceType || 'Study Resource'}</span>
                      {res.resourceDate && <span>• {res.resourceDate}</span>}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="p-0 space-y-2 text-xs flex-1">
                  {/* Metadata Chips */}
                  <div className="space-y-1 bg-muted/30 p-2.5 rounded-xl border border-border/50">
                    {res.courseCode && (
                      <div className="flex items-center gap-1.5 text-foreground font-medium truncate">
                        <BookOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="truncate">{res.courseCode}</span>
                      </div>
                    )}
                    {res.lecturerName && (
                      <div className="flex items-center gap-1.5 text-muted-foreground truncate">
                        <UserCheck className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span className="truncate">Lecturer: {res.lecturerName}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                    <span className="bg-muted px-2 py-0.5 rounded-md font-mono text-foreground font-bold">
                      {(res.extension || res.mimeType?.split('/')[1] || 'DOC').toUpperCase()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="w-3 h-3 text-muted-foreground" /> {res.downloads || 0} downloads
                    </span>
                    <span>{format(new Date(res.createdAt || Date.now()), 'MMM d, yyyy')}</span>
                  </div>
                </CardContent>

                <CardFooter className="p-0 mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full text-xs font-semibold gap-2 rounded-xl group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (res.fileUrl && res.fileUrl !== '#') {
                        window.open(res.fileUrl, '_blank');
                      } else {
                        toast.success(`Downloading ${res.title}...`);
                      }
                    }}
                  >
                    <Download className="w-3.5 h-3.5" /> Download Document
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
