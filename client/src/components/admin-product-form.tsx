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
import { X, Upload, Plus } from "lucide-react";
import type { ProductWithCategory, Category } from "@shared/schema";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.string().min(1, "Price is required"),
  imageUrls: z.array(z.string().url("Must be a valid URL")).optional(),
  categoryId: z.string().min(1, "Category is required"),
  inventory: z.string().min(1, "Inventory is required"),
  section: z.enum(["retail", "wholesale"]),
  isNew: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
});

type ProductFormData = z.infer<typeof productSchema>;

interface AdminProductFormProps {
  product?: ProductWithCategory;
  defaultSection?: "retail" | "wholesale";
}

export default function AdminProductForm({ product, defaultSection = "retail" }: AdminProductFormProps) {
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
        price: data.price,
        categoryId: parseInt(data.categoryId),
        inventory: parseInt(data.inventory),
      };
      
      if (product) {
        return await apiRequest("PUT", `/api/products/${product.id}`, productData);
      } else {
        return await apiRequest("POST", "/api/products", productData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: product ? "Product updated!" : "Product created!",
        description: `${form.getValues("name")} has been ${product ? "updated" : "added"} successfully.`,
      });
      if (!product) {
        form.reset();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || `Failed to ${product ? "update" : "create"} product. Please try again.`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductFormData) => {
    createProductMutation.mutate(data);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{product ? "Edit Product" : "Add New Product"}</CardTitle>
        <CardDescription>
          {product ? "Update product details" : "Add a new product to your inventory"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Enter product name"
                disabled={createProductMutation.isPending}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...form.register("price")}
                placeholder="0.00"
                disabled={createProductMutation.isPending}
              />
              {form.formState.errors.price && (
                <p className="text-sm text-red-500">{form.formState.errors.price.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Enter product description"
              disabled={createProductMutation.isPending}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <Select
                value={form.watch("categoryId")}
                onValueChange={(value) => form.setValue("categoryId", value)}
                disabled={createProductMutation.isPending}
              >
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
                <p className="text-sm text-red-500">{form.formState.errors.categoryId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="inventory">Inventory</Label>
              <Input
                id="inventory"
                type="number"
                {...form.register("inventory")}
                placeholder="0"
                disabled={createProductMutation.isPending}
              />
              {form.formState.errors.inventory && (
                <p className="text-sm text-red-500">{form.formState.errors.inventory.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="section">Section</Label>
              <Select
                value={form.watch("section")}
                onValueChange={(value: "retail" | "wholesale") => form.setValue("section", value)}
                disabled={createProductMutation.isPending}
              >
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

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              {...form.register("imageUrl")}
              placeholder="https://example.com/image.jpg"
              disabled={createProductMutation.isPending}
            />
            {form.formState.errors.imageUrl && (
              <p className="text-sm text-red-500">{form.formState.errors.imageUrl.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isNew"
                checked={form.watch("isNew")}
                onCheckedChange={(checked) => form.setValue("isNew", !!checked)}
                disabled={createProductMutation.isPending}
              />
              <Label htmlFor="isNew">Mark as New</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isBestseller"
                checked={form.watch("isBestseller")}
                onCheckedChange={(checked) => form.setValue("isBestseller", !!checked)}
                disabled={createProductMutation.isPending}
              />
              <Label htmlFor="isBestseller">Mark as Bestseller</Label>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-sunny-orange hover:bg-orange-500 text-white"
            disabled={createProductMutation.isPending}
          >
            {createProductMutation.isPending 
              ? (product ? "Updating..." : "Creating...") 
              : (product ? "Update Product" : "Create Product")
            }
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
