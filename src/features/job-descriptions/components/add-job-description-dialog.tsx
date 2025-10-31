import { useRef, useState, type ChangeEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircleIcon, UploadCloudIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  extractErrorMessage,
  extractFieldErrors,
  isValidationError,
} from "@/lib/api/errors";
import { toast } from "sonner";

const schema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Enter the job title.")
    .min(3, "Title is too short."),
});

type FormValues = z.infer<typeof schema>;

const MAX_FILE_SIZE_MB = 5;

const bytesFromMB = (mb: number) => mb * 1024 * 1024;

export type AddJobDescriptionDialogProperties = {
  isSubmitting?: boolean;
  onSubmit: (payload: { title: string; file: File }) => Promise<void>;
};

export const AddJobDescriptionDialog = ({
  isSubmitting,
  onSubmit,
}: AddJobDescriptionDialogProperties) => {
  const fileInputReference = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | undefined>();
  const [fileError, setFileError] = useState<string | undefined>();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "" },
  });

  const resetState = () => {
    form.reset();
    form.clearErrors();
    setFile(undefined);
    setFileError(undefined);
    if (fileInputReference.current) {
      fileInputReference.current.value = "";
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) {
      setFile(undefined);
      setFileError("Upload the job description PDF.");
      return;
    }
    if (
      selected.type !== "application/pdf" &&
      !selected.name.toLowerCase().endsWith(".pdf")
    ) {
      setFileError("Upload the job description file in PDF.");
      setFile(undefined);
      return;
    }
    if (selected.size > bytesFromMB(MAX_FILE_SIZE_MB)) {
      setFileError(`Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      setFile(undefined);
      return;
    }
    setFileError(undefined);
    setFile(selected);
  };

  const handleSubmit = async (values: FormValues) => {
    if (!file) {
      setFileError("Upload the job description file in PDF.");
      return;
    }
    form.clearErrors();
    try {
      await onSubmit({ title: values.title, file });
      resetState();
      setOpen(false);
    } catch (error) {
      if (isValidationError(error)) {
        const errors = extractFieldErrors(error);
        const generalMessages: string[] = [];
        for (const fieldError of errors) {
          if (fieldError.field === "job_description") {
            setFileError(fieldError.messages.join(" "));
            continue;
          }
          if (fieldError.field === "title") {
            form.setError("title", {
              type: "server",
              message: fieldError.messages.join(" "),
            });
            continue;
          }
          generalMessages.push(fieldError.messages.join(" "));
        }
        if (generalMessages.length > 0) {
          toast.error("Unable to create the opening", {
            description: generalMessages.join(" "),
          });
        }
      } else {
        toast.error("Unable to create the opening", {
          description: extractErrorMessage(error),
        });
      }
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        resetState();
      }}
    >
      <DialogTrigger asChild>
        <Button className="flex justify-center items-end gap-3">
          Add opening
          <PlusCircleIcon className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New opening</DialogTitle>
          <DialogDescription>
            Fill in the title and upload the job description PDF.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="grid gap-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., React Developer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-2">
              <label className="text-sm font-medium">Description (PDF)</label>
              <Button
                type="button"
                variant="outline"
                className="justify-start gap-2"
                onClick={() => fileInputReference.current?.click()}
              >
                <UploadCloudIcon className="size-4" />
                {file ? file.name : "Select file"}
              </Button>
              <input
                ref={fileInputReference}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              {fileError && (
                <p className="text-sm text-destructive">{fileError}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create opening"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
