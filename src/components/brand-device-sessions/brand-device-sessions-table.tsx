import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, Eye, Loader2 } from "lucide-react";

interface BrandDeviceSessionsTableProps {
  brandDeviceSessions?: AppTypes.PaginatedResponse<AppTypes.BrandDeviceSession>;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isSearching?: boolean;
}

export default function BrandDeviceSessionsTable({
  brandDeviceSessions,
  searchTerm,
  onSearchChange,
  isSearching,
}: BrandDeviceSessionsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Brand Device Sessions</CardTitle>
        <CardDescription>
          A list of all brand device sessions on your platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8"
            />
            {isSearching && (
              <Loader2 className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground animate-spin" />
            )}
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device Info</TableHead>
                <TableHead>App & Platform</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Timezone</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brandDeviceSessions?.records?.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">
                        {session.device_name || "Unknown Device"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {session.device_id?.substring(0, 16)}...
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">
                        {session.app_name || "N/A"} v
                        {session.app_version || "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {session.app_platform || "Unknown"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">
                        {session.region_code || "N/A"}
                      </div>
                      {session.latitude && session.longitude && (
                        <div className="text-sm text-muted-foreground">
                          {session.latitude.toFixed(2)},{" "}
                          {session.longitude.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">
                      {session.ip_address || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{session.timezone || "N/A"}</span>
                  </TableCell>
                  <TableCell>
                    {new Date(session.created_at * 1000).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
