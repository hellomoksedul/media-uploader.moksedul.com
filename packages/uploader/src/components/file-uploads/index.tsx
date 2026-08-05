import { Button } from "@/components/common/Button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Search as _Search } from "lucide-react";
import React from "react";
import { FiUpload as _FiUpload } from "react-icons/fi";
import { MdOutlineLaptopWindows as _MdOutlineLaptopWindows } from "react-icons/md";
import { ImageEditorDialog as _ImageEditorDialog } from "../ImageEditorDialog";
import _UploadedFiles from "./UploadedFiles";
import _UploadFiles from "./UploadFiles";
import { useMediaUploader } from "./useMediaUploader";
import _VideoUpload from "./VideoUpload";

const ImageEditorDialog = _ImageEditorDialog as unknown as (
  props: React.ComponentProps<typeof _ImageEditorDialog>,
) => any;
const UploadedFiles = _UploadedFiles as unknown as (
  props: React.ComponentProps<typeof _UploadedFiles>,
) => any;
const UploadFiles = _UploadFiles as unknown as (
  props: React.ComponentProps<typeof _UploadFiles>,
) => any;
const VideoUpload = _VideoUpload as unknown as (
  props: React.ComponentProps<typeof _VideoUpload>,
) => any;

const Search = _Search as unknown as (props: Record<string, any>) => any;
const FiUpload = _FiUpload as unknown as (props: Record<string, any>) => any;
const MdOutlineLaptopWindows = _MdOutlineLaptopWindows as unknown as (
  props: Record<string, any>,
) => any;

interface MediaUploaderProps {
  onClose: () => void;
  onConfirm: (
    uploadedUrls: string[] | string,
    ratio?: number,
    selectedType?: string,
  ) => void;
  title?: string;
  imageRatio?: number;
  isVideo?: boolean;
  freeRatio?: boolean;
  onlyVideo?: boolean;
  imageWidth?: number;
  imageFormat?: string;
  originalname?: string;
  isMultiple?: boolean;
  fileType?: "all" | "image" | "video";
  initialFile?: File | null;
}

const MediaUploader: React.FC<MediaUploaderProps> = (props) => {
  const {
    title = "Upload Files",
    imageRatio,
    imageWidth,
    imageFormat,
    isVideo = false,
    isMultiple = false,
    onClose,
  } = props;

  const {
    resolvedFileType,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedFileUrls,
    isCropping,
    setIsCropping,
    isVideoUpload,
    setIsVideoUpload,
    selectedFile,
    filteredFiles,
    isLoading,
    isLoadingMore,
    hasMore,
    onLoadMore,
    removeItem,
    onFileUpload,
    handleCropApply,
    handleVideoUploadConfirm,
    handleConfirm,
    handleFileSelect,
  } = useMediaUploader(props);

  const tabItems = [
    {
      id: 5,
      title: "Upload",
      icon: <FiUpload />,
      section: (
        <UploadFiles onFileUpload={onFileUpload} fileType={resolvedFileType} />
      ),
    },
    {
      id: 1,
      title: "My Files",
      icon: <MdOutlineLaptopWindows />,
      section: (
        <UploadedFiles
          files={filteredFiles}
          setFiles={() => {}}
          isLoading={isLoading}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isVideo={isVideo || resolvedFileType === "video"}
          onlyVideo={resolvedFileType === "video"}
          viewMode="grid"
          isMultiple={isMultiple}
          selectedFileUrls={selectedFileUrls}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          onLoadMore={onLoadMore}
          onImageSelect={(url, ratio, selectedType) =>
            handleFileSelect(url, ratio, false, selectedType)
          }
        />
      ),
    },
  ];

  return (
    <AlertDialog open={true} onOpenChange={onClose}>
      <AlertDialogContent
        className="w-[90vw] max-w-[90vw] h-[90vh] max-h-[95vh] gap-0 flex flex-col overflow-hidden p-4 lg:p-6 bg-card"
        style={{
          width: "90vw",
          maxWidth: "90vw",
          height: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="flex items-center justify-between shrink-0 pb-2 gap-4">
          <AlertDialogTitle className="text-lg font-semibold shrink-0">
            {isCropping ? "Edit Image" : isVideoUpload ? "Upload Video" : title}
          </AlertDialogTitle>
          {isCropping && (
            <div
              id="image-editor-header-center"
              className="flex-1 flex items-center justify-center min-h-8"
            />
          )}
          <button
            onClick={() => (isCropping ? setIsCropping(false) : onClose())}
            className="p-1 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors absolute right-3 top-3"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
        <div className="w-full flex-1 flex flex-col min-h-0">
          {isCropping && selectedFileUrls.length > 0 ? (
            <ImageEditorDialog
              onClose={() => setIsCropping(false)}
              imageUrl={selectedFileUrls[0]}
              aspectRatio={imageRatio}
              outputWidth={imageWidth}
              imageFormat={imageFormat}
              onSaveComplete={handleCropApply}
            />
          ) : isVideoUpload && (selectedFile || selectedFileUrls.length > 0) ? (
            <VideoUpload
              onBack={() => setIsVideoUpload(false)}
              file={selectedFile}
              url={selectedFileUrls[0]}
              onVideoUpload={handleVideoUploadConfirm}
            />
          ) : (
            <>
              <div className="flex flex-col sm:flex-row border-b border-border items-center justify-between gap-3 shrink-0 pb-3">
                <div className="hidden sm:flex items-center gap-1 bg-muted dark:bg-muted/50 p-1 rounded-lg w-full sm:w-auto overflow-x-auto ring-1 ring-black/5 dark:ring-white/5">
                  {tabItems.map((tab) => (
                    <button
                      type="button"
                      key={tab.id}
                      className={`flex items-center whitespace-nowrap justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        activeTab === tab.id
                          ? "bg-background text-foreground ring-1 ring-black/5 dark:bg-muted dark:text-foreground dark:ring-white/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50 dark:text-muted-foreground dark:hover:text-foreground dark:hover:bg-muted/50"
                      }`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      {tab.icon}
                      <span className="">{tab.title}</span>
                    </button>
                  ))}
                </div>
                {activeTab === 1 && (
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                      <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        size={16}
                      />
                      <Input
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 h-9 bg-background dark:bg-background rounded-lg border-border/60 dark:border-border/80 focus-visible:ring-primary/20 shadow-none text-sm"
                      />
                    </div>
                    <div className="sm:hidden relative shrink-0">
                      <Button
                        variant="outline"
                        className="h-9 w-9 p-0 rounded-lg relative overflow-hidden"
                      >
                        <FiUpload />
                        <input
                          type="file"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              onFileUpload(e.target.files[0]);
                              e.target.value = "";
                            }
                          }}
                          accept={
                            resolvedFileType === "image"
                              ? "image/*"
                              : resolvedFileType === "video"
                                ? "video/*"
                                : "*/*"
                          }
                        />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-3 flex-1 overflow-y-auto min-h-0 pb-5">
                {/* Clone element to pass viewMode if it's UploadedFiles */}
                {tabItems.find((tab) => tab.id === activeTab)?.id === 1 ? (
                  <UploadedFiles
                    files={filteredFiles}
                    onDelete={removeItem}
                    isLoading={isLoading}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    isVideo={isVideo || resolvedFileType === "video"}
                    onlyVideo={resolvedFileType === "video"}
                    viewMode="grid"
                    isMultiple={isMultiple}
                    selectedFileUrls={selectedFileUrls}
                    hasMore={hasMore}
                    isLoadingMore={isLoadingMore}
                    onLoadMore={onLoadMore}
                    onImageSelect={(url, ratio, selectedType) =>
                      handleFileSelect(url, ratio, false, selectedType)
                    }
                  />
                ) : (
                  tabItems.find((tab) => tab.id === activeTab)?.section
                )}
              </div>
              {activeTab !== 5 && (
                <div className="w-full flex justify-end pt-5 border-t border-border items-center gap-3 shrink-0">
                  <Button
                    variant="outline"
                    className="px-6"
                    onClick={() =>
                      isVideoUpload ? setIsVideoUpload(false) : onClose()
                    }
                  >
                    {isVideoUpload ? "Back" : "Cancel"}
                  </Button>
                  <Button
                    variant="default"
                    className="px-6"
                    onClick={handleConfirm}
                    disabled={selectedFileUrls.length === 0}
                  >
                    Confirm
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const MediaUploadDialog = MediaUploader;
export default MediaUploader;
