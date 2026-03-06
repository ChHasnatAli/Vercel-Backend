import { useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download } from "lucide-react";
import { fetchStoreUsers, formatUserDate, type StoreUser } from "@/lib/userApi";

type UserStatus = "active" | "inactive";

const avatarColors = ["bg-primary", "bg-info", "bg-success", "bg-warning", "bg-destructive", "bg-chart-3", "bg-chart-4", "bg-chart-2"];

export default function Users() {
  const [users, setUsers] = useState<StoreUser[]>([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("all");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadUsers = async (showLoader = false) => {
      try {
        if (showLoader && isMounted) {
          setLoading(true);
        }

        const data = await fetchStoreUsers();
        if (!isMounted) {
          return;
        }

        setUsers(data);
        setError(null);
      } catch {
        if (isMounted) {
          setError("Could not load users. Please ensure local-sync-server is running.");
        }
      } finally {
        if (showLoader && isMounted) {
          setLoading(false);
        }
      }
    };

    void loadUsers(true);
    const intervalId = window.setInterval(() => {
      void loadUsers(false);
    }, 5000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const getInitials = (user: StoreUser) => {
    const baseName = user.name || user.email;
    return baseName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "GU";
  };

  const getStatus = (user: StoreUser): UserStatus => {
    const lastLogin = new Date(user.lastLoginAt);
    if (Number.isNaN(lastLogin.getTime())) {
      return "inactive";
    }
    const daysSinceLogin = (Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceLogin <= 30 ? "active" : "inactive";
  };

  const filteredUsers = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return users.filter((user) => {
      const status = getStatus(user);
      const statusMatch = statusFilter === "all" || status === statusFilter;
      const queryMatch = !query
        || user.name.toLowerCase().includes(query)
        || user.email.toLowerCase().includes(query)
        || user.googleId.toLowerCase().includes(query);
      return statusMatch && queryMatch;
    });
  }, [searchText, statusFilter, users]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">System &gt; Users</p>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground text-sm mt-1">Google users who signed in from your store.</p>
        </div>
        <div className="text-sm text-muted-foreground">{filteredUsers.length} users</div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <Tabs defaultValue="all" onValueChange={(value) => setStatusFilter(value as "all" | UserStatus)}>
          <TabsList className="bg-secondary h-9 flex-wrap">
            <TabsTrigger value="all" className="text-xs px-4">All</TabsTrigger>
            <TabsTrigger value="active" className="text-xs px-4">Active</TabsTrigger>
            <TabsTrigger value="inactive" className="text-xs px-4">Inactive</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            className="h-8 rounded-md border border-border bg-background px-3 text-xs"
            placeholder="Search name, email, Google ID"
          />
          <Button variant="outline" size="sm" className="gap-1 text-xs">
            <Download className="w-3 h-3" /> Export
          </Button>
        </div>
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {loading ? <p className="text-xs text-muted-foreground">Loading users...</p> : null}

      <Card className="bg-card border-border overflow-x-auto">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead>User</TableHead>
                <TableHead className="hidden lg:table-cell">Google ID</TableHead>
                <TableHead className="hidden lg:table-cell">Created</TableHead>
                <TableHead className="hidden lg:table-cell">Last Login</TableHead>
                <TableHead>Email Verified</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user, index) => (
                <TableRow key={user.id} className="border-border">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className={`h-8 w-8 ${avatarColors[index % avatarColors.length]}`}>
                        {user.picture ? (
                          <img src={user.picture} alt={user.name || user.email} className="h-full w-full object-cover" />
                        ) : (
                          <AvatarFallback className="text-xs text-primary-foreground bg-transparent">{getInitials(user)}</AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.name || "No name"}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-mono hidden lg:table-cell">{user.googleId}</TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{formatUserDate(user.createdAt)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{formatUserDate(user.lastLoginAt)}</TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] px-2 ${user.emailVerified ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}`}>
                      {user.emailVerified ? "Verified" : "Unverified"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`text-[10px] px-2 capitalize ${
                        getStatus(user) === "active"
                          ? "bg-success text-success-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {getStatus(user)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>Showing {filteredUsers.length} users</span>
      </div>
    </div>
  );
}
