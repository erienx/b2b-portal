/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo } from "react";
import { useApi } from "../hooks/useApi";
import { Upload, Search, Download, File, Image, FileText, Video, Music, Archive, Filter, Grid, List, Folder, CheckSquare, Square } from "lucide-react";
import { useAuth } from "../context/AuthContext";

type MediaFile = {
    id: string;
    filename: string;
    original_filename: string;
    file_size: number;
    mime_type: string;
    sku: string | null;
    tags: string[];
    description: string | null;
    created_at: string;
    updated_at: string;
    category: MediaCategory | null;
    uploadedBy: {
        first_name: string;
        last_name: string;
    } | null;
};

type MediaCategory = {
    id: string;
    name: string;
    path: string;
    description: string | null;
    is_active: boolean;
    created_at: string;
};

type MediaResponse = {
    items: MediaFile[];
    total: number;
    page: number;
    limit: number;
};

export default function MediaPage() {
    const { currentUser } = useAuth();

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [skuFilter, setSkuFilter] = useState('');
    const [tagFilter, setTagFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [sortBy, setSortBy] = useState('created_at:DESC');
    const [page, setPage] = useState(1);
    const [limit] = useState(25);

    const [showUpload, setShowUpload] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadSku, setUploadSku] = useState('');
    const [uploadTags, setUploadTags] = useState('');
    const [uploadDescription, setUploadDescription] = useState('');
    const [uploadCategoryId, setUploadCategoryId] = useState('');

    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryPath, setNewCategoryPath] = useState('');
    const [newCategoryDescription, setNewCategoryDescription] = useState('');

    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [categories, setCategories] = useState<MediaCategory[]>([]);
    const [total, setTotal] = useState(0);

    // API hooks
    const { fetch: fetchMedia } = useApi<MediaResponse>(null);
    const { fetch: fetchCategories } = useApi<MediaCategory[]>(null);
    const { fetch: uploadMediaFile } = useApi<MediaFile>(null);
    const { fetch: createCategory } = useApi<MediaCategory>(null);
    const { fetch: downloadFile } = useApi<Blob>(null);
    const { fetch: downloadMultiple } = useApi<Blob>(null);

    // Build query parameters
    const queryParams = useMemo(() => {
        const params = new URLSearchParams();
        if (searchTerm) params.append('filename', searchTerm);
        if (skuFilter) params.append('sku', skuFilter);
        if (tagFilter) params.append('tag', tagFilter);
        if (categoryFilter) params.append('categoryId', categoryFilter);
        if (sortBy) params.append('sort', sortBy);
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        return params.toString();
    }, [searchTerm, skuFilter, tagFilter, categoryFilter, sortBy, page, limit]);

    // Load media files
    const loadMedia = () => {
        fetchMedia({ url: `/media?${queryParams}`, method: 'GET' })
            .then((data) => {
                if (data) {
                    setMediaFiles(data.items);
                    setTotal(data.total);
                }
            })
            .catch(() => {
                setMediaFiles([]);
                setTotal(0);
            });
    };

    // Load categories
    const loadCategories = () => {
        fetchCategories({ url: '/media/categories', method: 'GET' })
            .then((data) => {
                setCategories(data || []);
            })
            .catch(() => {
                setCategories([]);
            });
    };

    useEffect(() => {
        loadMedia();
    }, [queryParams]);

    useEffect(() => {
        loadCategories();
    }, [currentUser]);

    // File upload
    const handleUpload = async () => {
        if (!uploadFile) {
            alert('Please select a file');
            return;
        }

        const formData = new FormData();
        formData.append('file', uploadFile);
        if (uploadSku) formData.append('sku', uploadSku);
        if (uploadTags) {
            const tagsArray = uploadTags
                .split(',')
                .map(t => t.trim())
                .filter(t => t.length > 0);

            formData.append('tags', JSON.stringify(tagsArray));
        }
        if (uploadDescription) formData.append('description', uploadDescription);
        if (uploadCategoryId) formData.append('categoryId', uploadCategoryId);

        try {
            await uploadMediaFile({
                url: '/media/upload',
                method: 'POST',
                data: formData,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Reset form
            setUploadFile(null);
            setUploadSku('');
            setUploadTags('');
            setUploadDescription('');
            setUploadCategoryId('');
            setShowUpload(false);

            // Reload data
            loadMedia();
            alert('File uploaded successfully');
        } catch (err: any) {
            alert('Upload failed: ' + (err.message || err));
        }
    };

    // Category creation
    const handleCreateCategory = async () => {
        if (!newCategoryName || !newCategoryPath) {
            alert('Name and path are required');
            return;
        }

        try {
            await createCategory({
                url: '/media/categories',
                method: 'POST',
                data: {
                    name: newCategoryName,
                    path: newCategoryPath,
                    description: newCategoryDescription || undefined
                }
            });

            // Reset form
            setNewCategoryName('');
            setNewCategoryPath('');
            setNewCategoryDescription('');
            setShowCategoryForm(false);

            // Reload categories
            loadCategories();
            alert('Category created successfully');
        } catch (err: any) {
            alert('Category creation failed: ' + (err.message || err));
        }
    };

    // File download
    const handleDownload = async (fileId: string, filename: string) => {
        try {
            const blob = await downloadFile({
                url: `/media/${fileId}/download`,
                method: 'GET',
                responseType: 'blob'
            });

            if (blob) {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (err: any) {
            alert('Download failed: ' + (err.message || err));
        }
    };

    // Multiple file download
    const handleDownloadMultiple = async () => {
        if (selectedFiles.length === 0) {
            alert('Please select files to download');
            return;
        }

        try {
            const blob = await downloadMultiple({
                url: `/media/download-multiple?ids=${selectedFiles.join(',')}`,
                method: 'GET',
                responseType: 'blob'
            });

            if (blob) {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'media_files.zip';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (err: any) {
            alert('Download failed: ' + (err.message || err));
        }
    };

    // File selection
    const toggleFileSelection = (fileId: string) => {
        setSelectedFiles(prev =>
            prev.includes(fileId)
                ? prev.filter(id => id !== fileId)
                : [...prev, fileId]
        );
    };

    const selectAllFiles = () => {
        setSelectedFiles(mediaFiles.map(f => f.id));
    };

    const clearSelection = () => {
        setSelectedFiles([]);
    };

    // File type icon
    const getFileIcon = (mimeType: string) => {
        if (mimeType.startsWith('image/')) return <Image className="w-5 h-5" />;
        if (mimeType.startsWith('video/')) return <Video className="w-5 h-5" />;
        if (mimeType.startsWith('audio/')) return <Music className="w-5 h-5" />;
        if (mimeType.includes('pdf')) return <FileText className="w-5 h-5" />;
        if (mimeType.includes('zip') || mimeType.includes('rar')) return <Archive className="w-5 h-5" />;
        return <File className="w-5 h-5" />;
    };

    // Format file size
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Pagination
    const totalPages = Math.ceil(total / limit);

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Media Library</h1>
                    <p className="text-grey">Marketing materials and product files</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleDownloadMultiple}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Download ({selectedFiles.length})
                    </button>

                    {(
                        <button
                            onClick={() => setShowCategoryForm(true)}
                            className="bg-surfaceLight hover:bg-surfaceHover text-white px-3 py-2 rounded-md flex items-center gap-2"
                        >
                            <Folder className="w-4 h-4" />
                            Add Category
                        </button>
                    )}

                    <button
                        onClick={() => setShowUpload(true)}
                        className="bg-accent-bg hover:bg-accent-hover text-white px-4 py-2 rounded-md flex items-center gap-2"
                    >
                        <Upload className="w-4 h-4" />
                        Upload File
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-surface p-4 rounded-lg border border-surfaceLight mb-6">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                        <Search className="w-5 h-5 text-grey" />
                        <input
                            type="text"
                            placeholder="Search files..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-bg text-white px-3 py-2 rounded-md w-64"
                        />
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="bg-surfaceLight text-white px-3 py-2 rounded-md flex items-center gap-2"
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-accent-bg text-white' : 'bg-surfaceLight text-grey'}`}
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded ${viewMode === 'list' ? 'bg-accent-bg text-white' : 'bg-surfaceLight text-grey'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-surfaceLight">
                        <div>
                            <label className="text-grey text-sm mb-1 block">SKU</label>
                            <input
                                type="text"
                                placeholder="Filter by SKU..."
                                value={skuFilter}
                                onChange={(e) => setSkuFilter(e.target.value)}
                                className="bg-bg text-white px-2 py-1 rounded w-full"
                            />
                        </div>

                        <div>
                            <label className="text-grey text-sm mb-1 block">Tag</label>
                            <input
                                type="text"
                                placeholder="Filter by tag..."
                                value={tagFilter}
                                onChange={(e) => setTagFilter(e.target.value)}
                                className="bg-bg text-white px-2 py-1 rounded w-full"
                            />
                        </div>

                        <div>
                            <label className="text-grey text-sm mb-1 block">Category</label>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="bg-bg text-white px-2 py-1 rounded w-full"
                            >
                                <option value="">All categories</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-grey text-sm mb-1 block">Sort by</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-bg text-white px-2 py-1 rounded w-full"
                            >
                                <option value="created_at:DESC">Newest first</option>
                                <option value="created_at:ASC">Oldest first</option>
                                <option value="original_filename:ASC">Name A-Z</option>
                                <option value="original_filename:DESC">Name Z-A</option>
                                <option value="file_size:DESC">Largest first</option>
                                <option value="file_size:ASC">Smallest first</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Selection controls */}
            {mediaFiles.length > 0 && (
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <span className="text-grey">
                            {total} files total
                        </span>
                        {selectedFiles.length > 0 && (
                            <span className="text-white">
                                {selectedFiles.length} selected
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={selectAllFiles}
                            className="text-accent-bg hover:text-accent-hover text-sm"
                        >
                            Select all
                        </button>
                        {selectedFiles.length > 0 && (
                            <button
                                onClick={clearSelection}
                                className="text-grey hover:text-white text-sm"
                            >
                                Clear selection
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Files Grid/List */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
                    {mediaFiles.map((file) => (
                        <div
                            key={file.id}
                            className={`bg-surface rounded-lg border p-3 hover:border-accent-bg transition-colors ${selectedFiles.includes(file.id) ? 'border-accent-bg' : 'border-surfaceLight'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <button
                                    onClick={() => toggleFileSelection(file.id)}
                                    className="text-grey hover:text-white"
                                >
                                    {selectedFiles.includes(file.id) ? (
                                        <CheckSquare className="w-4 h-4 text-accent-bg" />
                                    ) : (
                                        <Square className="w-4 h-4" />
                                    )}
                                </button>

                                <button
                                    onClick={() => handleDownload(file.id, file.original_filename)}
                                    className="text-grey hover:text-white"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex items-center justify-center bg-bg rounded-lg h-20 mb-3">
                                <div className="text-grey">
                                    {getFileIcon(file.mime_type)}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-white text-sm font-medium truncate mb-1">
                                    {file.original_filename}
                                </h3>

                                <div className="text-xs text-grey space-y-1">
                                    <div>{formatFileSize(file.file_size)}</div>
                                    <div>{formatDate(file.created_at)}</div>
                                    {file.sku && (
                                        <div className="text-accent-bg">SKU: {file.sku}</div>
                                    )}
                                    {file.category && (
                                        <div className="text-blue-400">{file.category.name}</div>
                                    )}
                                </div>

                                {file.tags && file.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {file.tags.slice(0, 2).map((tag, idx) => (
                                            <span key={idx} className="text-xs bg-surfaceLight text-grey px-1 py-0.5 rounded">
                                                {tag}
                                            </span>
                                        ))}
                                        {file.tags.length > 2 && (
                                            <span className="text-xs text-grey">+{file.tags.length - 2}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-surface rounded-lg border border-surfaceLight overflow-hidden mb-6">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-surfaceLight">
                                <tr className="text-left text-grey text-sm">
                                    <th className="p-3 w-8">
                                        <button onClick={selectedFiles.length === mediaFiles.length ? clearSelection : selectAllFiles}>
                                            {selectedFiles.length === mediaFiles.length && mediaFiles.length > 0 ? (
                                                <CheckSquare className="w-4 h-4 text-accent-bg" />
                                            ) : (
                                                <Square className="w-4 h-4" />
                                            )}
                                        </button>
                                    </th>
                                    <th className="p-3">File</th>
                                    <th className="p-3">Size</th>
                                    <th className="p-3">SKU</th>
                                    <th className="p-3">Category</th>
                                    <th className="p-3">Tags</th>
                                    <th className="p-3">Uploaded</th>
                                    <th className="p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mediaFiles.map((file) => (
                                    <tr key={file.id} className="border-t border-surfaceLight hover:bg-surfaceLight/50">
                                        <td className="p-3">
                                            <button onClick={() => toggleFileSelection(file.id)}>
                                                {selectedFiles.includes(file.id) ? (
                                                    <CheckSquare className="w-4 h-4 text-accent-bg" />
                                                ) : (
                                                    <Square className="w-4 h-4 text-grey" />
                                                )}
                                            </button>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-3">
                                                <div className="text-grey">
                                                    {getFileIcon(file.mime_type)}
                                                </div>
                                                <div>
                                                    <div className="text-white text-sm font-medium">
                                                        {file.original_filename}
                                                    </div>
                                                    {file.description && (
                                                        <div className="text-xs text-grey mt-1">
                                                            {file.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3 text-grey text-sm">
                                            {formatFileSize(file.file_size)}
                                        </td>
                                        <td className="p-3 text-sm">
                                            {file.sku ? (
                                                <span className="text-accent-bg">{file.sku}</span>
                                            ) : (
                                                <span className="text-grey">-</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-sm">
                                            {file.category ? (
                                                <span className="text-blue-400">{file.category.name}</span>
                                            ) : (
                                                <span className="text-grey">-</span>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            {file.tags && file.tags.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {file.tags.slice(0, 3).map((tag, idx) => (
                                                        <span key={idx} className="text-xs bg-surfaceLight text-grey px-2 py-0.5 rounded">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {file.tags.length > 3 && (
                                                        <span className="text-xs text-grey">+{file.tags.length - 3}</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-grey text-sm">-</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-grey text-sm">
                                            <div>{formatDate(file.created_at)}</div>
                                            {file.uploadedBy && (
                                                <div className="text-xs">
                                                    {file.uploadedBy.first_name} {file.uploadedBy.last_name}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            <button
                                                onClick={() => handleDownload(file.id, file.original_filename)}
                                                className="text-grey hover:text-white"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-grey text-sm">
                        Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} files
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="px-3 py-1 bg-surfaceLight text-white rounded disabled:opacity-50"
                        >
                            Previous
                        </button>

                        <div className="flex gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                                const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                                if (pageNum > totalPages) return null;

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setPage(pageNum)}
                                        className={`px-3 py-1 rounded ${pageNum === page
                                            ? 'bg-accent-bg text-white'
                                            : 'bg-surfaceLight text-grey hover:text-white'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages}
                            className="px-3 py-1 bg-surfaceLight text-white rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Upload Modal */}
            {showUpload && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-surface p-6 rounded-lg border border-surfaceLight w-full max-w-md">
                        <h2 className="text-lg font-semibold text-white mb-4">Upload File</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-grey text-sm mb-1 block">File</label>
                                <input
                                    type="file"
                                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                    className="bg-bg text-white px-3 py-2 rounded w-full"
                                />
                            </div>

                            <div>
                                <label className="text-grey text-sm mb-1 block">SKU (optional)</label>
                                <input
                                    type="text"
                                    value={uploadSku}
                                    onChange={(e) => setUploadSku(e.target.value)}
                                    placeholder="e.g. SKU123"
                                    className="bg-bg text-white px-3 py-2 rounded w-full"
                                />
                            </div>

                            <div>
                                <label className="text-grey text-sm mb-1 block">Category (optional)</label>
                                <select
                                    value={uploadCategoryId}
                                    onChange={(e) => setUploadCategoryId(e.target.value)}
                                    className="bg-bg text-white px-3 py-2 rounded w-full"
                                >
                                    <option value="">No category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-grey text-sm mb-1 block">Tags (optional)</label>
                                <input
                                    type="text"
                                    value={uploadTags}
                                    onChange={(e) => setUploadTags(e.target.value)}
                                    placeholder="tag1, tag2, tag3"
                                    className="bg-bg text-white px-3 py-2 rounded w-full"
                                />
                                <div className="text-xs text-grey mt-1">Separate multiple tags with commas</div>
                            </div>

                            <div>
                                <label className="text-grey text-sm mb-1 block">Description (optional)</label>
                                <textarea
                                    value={uploadDescription}
                                    onChange={(e) => setUploadDescription(e.target.value)}
                                    placeholder="File description..."
                                    rows={3}
                                    className="bg-bg text-white px-3 py-2 rounded w-full resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowUpload(false)}
                                className="px-4 py-2 text-grey hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={!uploadFile}
                                className="bg-accent-bg hover:bg-accent-hover text-white px-4 py-2 rounded disabled:opacity-50"
                            >
                                Upload
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Category Creation Modal */}
            {showCategoryForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-surface p-6 rounded-lg border border-surfaceLight w-full max-w-md">
                        <h2 className="text-lg font-semibold text-white mb-4">Create Category</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-grey text-sm mb-1 block">Name *</label>
                                <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="e.g. Products"
                                    className="bg-bg text-white px-3 py-2 rounded w-full"
                                />
                            </div>

                            <div>
                                <label className="text-grey text-sm mb-1 block">Path *</label>
                                <input
                                    type="text"
                                    value={newCategoryPath}
                                    onChange={(e) => setNewCategoryPath(e.target.value)}
                                    placeholder="e.g. /PRODUCTS/"
                                    className="bg-bg text-white px-3 py-2 rounded w-full"
                                />
                                <div className="text-xs text-grey mt-1">Unique folder path identifier</div>
                            </div>

                            <div>
                                <label className="text-grey text-sm mb-1 block">Description (optional)</label>
                                <textarea
                                    value={newCategoryDescription}
                                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                                    placeholder="Category description..."
                                    rows={3}
                                    className="bg-bg text-white px-3 py-2 rounded w-full resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowCategoryForm(false)}
                                className="px-4 py-2 text-grey hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateCategory}
                                disabled={!newCategoryName || !newCategoryPath}
                                className="bg-accent-bg hover:bg-accent-hover text-white px-4 py-2 rounded disabled:opacity-50"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {mediaFiles.length === 0 && (
                <div className="text-center py-12">
                    <File className="w-12 h-12 text-grey mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No files found</h3>
                    <p className="text-grey mb-4">
                        {searchTerm || skuFilter || tagFilter || categoryFilter
                            ? "Try adjusting your search filters"
                            : "Upload your first media file to get started"}
                    </p>

                    <button
                        onClick={() => setShowUpload(true)}
                        className="bg-accent-bg hover:bg-accent-hover text-white px-4 py-2 rounded-md inline-flex items-center gap-2"
                    >
                        <Upload className="w-4 h-4" />
                        Upload File
                    </button>
                </div>
            )}
        </div>
    );
}