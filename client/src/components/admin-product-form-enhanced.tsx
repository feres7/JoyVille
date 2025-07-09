import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { X, Upload, Plus, ImageIcon } from "lucide-react";
import type { ProductWithCategory, Category } from "@shared/schema";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  reference: z.string().min(1, "Product reference is required"),
  description: z.string().optional(),
  price: z.string().min(1, "Price is required"),
  imageUrls: z.array(z.string().url("Must be a valid URL")).optional(),
  categoryId: z.string().min(1, "Category is required"),
  inventory: z.string().min(1, "Inventory is required").refine((val) => {
    const num = parseInt(val);
    return !isNaN(num) && num >= 0;
  }, "Inventory cannot be negative"),
  section: z.enum(["retail", "wholesale"]),
  isNew: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
});

type ProductFormData = z.infer<typeof productSchema>;

interface AdminProductFormProps {
  product?: ProductWithCategory;
  defaultSection?: "retail" | "wholesale";
}

export default function AdminProductFormEnhanced({ product, defaultSection = "retail" }: AdminProductFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [imageUrls, setImageUrls] = useState<string[]>(product?.imageUrls || []);
  const [newImageUrl, setNewImageUrl] = useState("");

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      reference: product?.reference || "",
      description: product?.description || "",
      price: product?.price || "",
      imageUrls: product?.imageUrls || [],
      categoryId: product?.categoryId?.toString() || "",
      inventory: product?.inventory?.toString() || "0",
      section: (product?.section as "retail" | "wholesale") || defaultSection,
      isNew: product?.isNew || false,
      isBestseller: product?.isBestseller || false,
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const productData = {
        ...data,
        imageUrls: imageUrls,
        price: data.price,
        categoryId: parseInt(data.categoryId),
        inventory: parseInt(data.inventory),
      };
      
      if (product) {
        return await apiRequest(`/api/products/${product.id}`, {
          method: "PUT",
          body: JSON.stringify(productData),
        });
      } else {
        return await apiRequest("/api/products", {
          method: "POST", 
          body: JSON.stringify(productData),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: product ? "Product updated!" : "Product created!",
        description: `${form.getValues("name")} has been ${product ? "updated" : "added"} successfully.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductFormData) => {
    createProductMutation.mutate(data);
  };

  const addImageUrl = () => {
    if (newImageUrl && !imageUrls.includes(newImageUrl)) {
      setImageUrls([...imageUrls, newImageUrl]);
      setNewImageUrl("");
    }
  };

  const removeImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // For demonstration purposes, we'll convert to a data URL
      // In production, you'd upload to a file storage service
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result && !imageUrls.includes(result)) {
          setImageUrls([...imageUrls, result]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{product ? "Edit Product" : "Add New Product"}</CardTitle>
        <CardDescription>
          {product ? "Update the product details below" : "Fill in the details to add a new product"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Enter product name"
              />
              {form.formState.errors.name && (
                <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="reference">Product Reference</Label>
              <Input
                id="reference"
                {...form.register("reference")}
                placeholder="e.g., PLU-001, BLD-002"
              />
              {form.formState.errors.reference && (
                <p className="text-red-500 text-sm">{form.formState.errors.reference.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Enter product description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  {...form.register("price")}
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                />
                {form.formState.errors.price && (
                  <p className="text-red-500 text-sm">{form.formState.errors.price.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="inventory">Inventory</Label>
                <Input
                  id="inventory"
                  {...form.register("inventory")}
                  placeholder="0"
                  type="number"
                  min="0"
                />
                {form.formState.errors.inventory && (
                  <p className="text-red-500 text-sm">{form.formState.errors.inventory.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className="space-y-4">
            <Label>Product Images</Label>
            
            {/* Current Images */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={url} 
                      alt={`Product image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImageUrl(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Image URL */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Enter image URL"
                  type="url"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addImageUrl}
                  disabled={!newImageUrl}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <Label htmlFor="file-upload" className="cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    Click to upload an image or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, JPEG up to 10MB
                  </p>
                </div>
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Category and Section */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="categoryId">Category</Label>
              <Select value={form.watch("categoryId")} onValueChange={(value) => form.setValue("categoryId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.categoryId && (
                <p className="text-red-500 text-sm">{form.formState.errors.categoryId.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="section">Section</Label>
              <Select value={form.watch("section")} onValueChange={(value) => form.setValue("section", value as "retail" | "wholesale")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="wholesale">Wholesale</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Flags */}
          <div className="flex space-x-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isNew"
                checked={form.watch("isNew")}
                onCheckedChange={(checked) => form.setValue("isNew", !!checked)}
              />
              <Label htmlFor="isNew">Mark as New</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isBestseller"
                checked={form.watch("isBestseller")}
                onCheckedChange={(checked) => form.setValue("isBestseller", !!checked)}
              />
              <Label htmlFor="isBestseller">Mark as Bestseller</Label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="submit"
              disabled={createProductMutation.isPending}
              className="bg-mint-300 hover:bg-mint-400 text-gray-800"
            >
              {createProductMutation.isPending ? "Saving..." : (product ? "Update Product" : "Create Product")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}