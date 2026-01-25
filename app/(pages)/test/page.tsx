"use client";

import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconCircleCheckFilled, IconLoader } from "@tabler/icons-react";
import { toast } from "sonner";

// Define the data type
type TestData = {
  id: number;
  header: string;
  type: string;
  status: string;
  target: string;
  limit: string;
  reviewer: string;
};

// Sample data for testing the DataTable component
const sampleData: TestData[] = [
  {
    id: 1,
    header: "Q1 Sales Report",
    type: "Financial",
    status: "Done",
    target: "$50,000",
    limit: "$100,000",
    reviewer: "John Doe",
  },
  {
    id: 2,
    header: "Marketing Campaign",
    type: "Marketing",
    status: "In Progress",
    target: "10,000 leads",
    limit: "20,000 leads",
    reviewer: "Jane Smith",
  },
  {
    id: 3,
    header: "Product Development",
    type: "Engineering",
    status: "Done",
    target: "5 features",
    limit: "10 features",
    reviewer: "Mike Johnson",
  },
  {
    id: 4,
    header: "Customer Support Tickets",
    type: "Support",
    status: "In Progress",
    target: "100 tickets",
    limit: "200 tickets",
    reviewer: "Sarah Williams",
  },
  {
    id: 5,
    header: "Website Redesign",
    type: "Design",
    status: "Done",
    target: "5 pages",
    limit: "15 pages",
    reviewer: "Alex Brown",
  },
  {
    id: 6,
    header: "SEO Optimization",
    type: "Marketing",
    status: "In Progress",
    target: "50 keywords",
    limit: "100 keywords",
    reviewer: "Emily Davis",
  },
  {
    id: 7,
    header: "Database Migration",
    type: "Engineering",
    status: "Done",
    target: "1TB data",
    limit: "2TB data",
    reviewer: "Chris Wilson",
  },
  {
    id: 8,
    header: "Content Strategy",
    type: "Content",
    status: "In Progress",
    target: "20 articles",
    limit: "50 articles",
    reviewer: "Lisa Anderson",
  },
  {
    id: 9,
    header: "Mobile App Launch",
    type: "Engineering",
    status: "Done",
    target: "iOS & Android",
    limit: "All platforms",
    reviewer: "Tom Martinez",
  },
  {
    id: 10,
    header: "Email Campaign",
    type: "Marketing",
    status: "In Progress",
    target: "5,000 opens",
    limit: "10,000 opens",
    reviewer: "Rachel Taylor",
  },
  {
    id: 11,
    header: "Security Audit",
    type: "Security",
    status: "Done",
    target: "10 vulnerabilities",
    limit: "0 vulnerabilities",
    reviewer: "David Moore",
  },
  {
    id: 12,
    header: "Training Program",
    type: "HR",
    status: "In Progress",
    target: "50 employees",
    limit: "100 employees",
    reviewer: "Karen White",
  },
];

// Define columns for the table
const columns: ColumnDef<TestData>[] = [
  {
    accessorKey: "header",
    header: "Header",
    cell: ({ row }) => <div className="font-medium">{row.original.header}</div>,
    enableHiding: false,
  },
  {
    accessorKey: "type",
    header: "Section Type",
    cell: ({ row }) => (
      <div className="w-32">
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {row.original.type}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {row.original.status === "Done" ? (
          <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400 size-4" />
        ) : (
          <IconLoader className="size-4" />
        )}
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "target",
    header: () => <div className="w-full text-right">Target</div>,
    cell: ({ row }) => (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
            loading: `Saving ${row.original.header}`,
            success: "Done",
            error: "Error",
          });
        }}
      >
        <Label htmlFor={`${row.original.id}-target`} className="sr-only">
          Target
        </Label>
        <Input
          className="h-8 w-24 border-transparent bg-transparent text-right shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background dark:bg-transparent dark:hover:bg-input/30 dark:focus-visible:bg-input/30"
          defaultValue={row.original.target}
          id={`${row.original.id}-target`}
        />
      </form>
    ),
  },
  {
    accessorKey: "limit",
    header: () => <div className="w-full text-right">Limit</div>,
    cell: ({ row }) => (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
            loading: `Saving ${row.original.header}`,
            success: "Done",
            error: "Error",
          });
        }}
      >
        <Label htmlFor={`${row.original.id}-limit`} className="sr-only">
          Limit
        </Label>
        <Input
          className="h-8 w-24 border-transparent bg-transparent text-right shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background dark:bg-transparent dark:hover:bg-input/30 dark:focus-visible:bg-input/30"
          defaultValue={row.original.limit}
          id={`${row.original.id}-limit`}
        />
      </form>
    ),
  },
  {
    accessorKey: "reviewer",
    header: "Reviewer",
    cell: ({ row }) => <div>{row.original.reviewer}</div>,
  },
];

export default function TestPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">DataTable Component Test</h1>
        <p className="text-muted-foreground">
          Testing the DataTable component with sample data. Features include:
          sorting, filtering, pagination, column visibility, drag-and-drop
          reordering, and row selection.
        </p>
      </div>

      <DataTable data={sampleData} columns={columns} />
    </div>
  );
}
