import { ConfirmDialog } from "../common/ConfirmDialog";
import { useState } from "react";
import { RiDeleteBinLine } from "react-icons/ri";
import { toast } from "sonner";
import { useMediaContext } from "../MediaProvider";

interface IDeleteItemProps {
  fileId: string;
  onDelete: (fileId: string) => void;
}

const DeleteItem = ({ fileId, onDelete }: IDeleteItemProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(false);
  const { deleteMedia } = useMediaContext();

  const handleDelete = async () => {
    try {
      setLoading(true);
      const res = await deleteMedia(fileId);

      if (!res.success) {
        throw new Error(res.error || "Failed to delete the file.");
      }

      toast.success("File deleted successfully!");
      onDelete(fileId); // Remove item from the list instantly
      setIsOpen(false);
    } catch (error) {
      toast.error("Error deleting file: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        className="p-1 bg-muted/50 hover:bg-destructive/10 text-destructive rounded-md transition-colors"
        disabled={loading}
      >
        {loading ? (
          <span className="flex justify-center items-center">
            <span className="loading loading-spinner loading-sm"></span>
          </span>
        ) : (
          <RiDeleteBinLine />
        )}
      </button>
      <ConfirmDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        title="Delete File"
        description="This action cannot be undone. This will permanently delete the file."
        confirmText="Delete"
        variant="destructive"
        isLoading={loading}
      />
    </>
  );
};

export default DeleteItem;
