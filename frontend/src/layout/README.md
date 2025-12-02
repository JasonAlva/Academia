# Dashboard Layout System

A role-based dashboard layout system built with shadcn/ui components that adapts based on user roles (admin, teacher, student).

## Features

- **Role-Based Navigation**: Automatically displays different navigation items based on user role
- **Reusable Components**: Sidebar, TopBar, and main layout wrapper
- **Shadcn/ui Integration**: Built using shadcn/ui dashboard blocks
- **TypeScript Support**: Fully typed for better developer experience
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## File Structure

```
src/
├── layout/
│   ├── DashboardLayout.tsx    # Main layout wrapper
│   ├── app-sidebar.tsx        # Sidebar component
│   ├── top-bar.tsx            # Top navigation bar
│   ├── nav-main.tsx           # Main navigation items
│   ├── nav-secondary.tsx      # Secondary navigation items
│   ├── nav-documents.tsx      # Quick links/documents section
│   ├── nav-user.tsx           # User profile menu
│   └── index.ts               # Export barrel file
├── config/
│   └── dashboard.config.ts    # Role-based configuration
└── pages/
    └── admin/
        └── AdminDashboard.tsx # Example usage
```

## Configuration

The dashboard configuration is defined in `src/config/dashboard.config.ts`:

### User Roles

Three user roles are supported:

- `admin`: Full system access with analytics and management features
- `teacher`: Course management, attendance, and student interactions
- `student`: Course viewing, schedule, grades, and materials

### Config Structure

Each role configuration includes:

- `companyName`: Display name in the sidebar header
- `companyLogo`: Icon component for the logo
- `navMain`: Primary navigation items
- `navSecondary`: Secondary navigation items (Settings, Help, etc.)
- `navDocuments`: Quick links section (optional)

### Customizing Navigation

Edit `dashboard.config.ts` to add/remove navigation items:

```typescript
const adminConfig: Omit<DashboardConfig, "user"> = {
  companyName: "College Admin",
  companyLogo: IconSchool,
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: IconChartBar,
      badge: "New", // Optional badge
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/admin/settings",
      icon: IconSettings,
    },
  ],
};
```

## Usage

### Basic Usage

Wrap your page content with `DashboardLayout`:

```tsx
import { DashboardLayout } from "@/layout";

export default function MyPage() {
  return (
    <DashboardLayout title="Page Title">
      <div className="p-4">{/* Your page content */}</div>
    </DashboardLayout>
  );
}
```

### How It Works

1. **DashboardLayout** reads the current user from `AuthContext`
2. Calls `getDashboardConfig(role, user)` to get role-specific configuration
3. Renders `AppSidebar` with the configuration
4. Renders `TopBar` with the page title
5. Renders your page content in the main area

### User Authentication

The layout requires a user to be logged in via `AuthContext`. The user object must have:

```typescript
{
  id: string;
  email: string;
  role: "admin" | "teacher" | "student";
  name: string;
}
```

### Example: Admin Dashboard

```tsx
import { DashboardLayout } from "@/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,350</div>
            </CardContent>
          </Card>
          {/* More cards... */}
        </div>
      </div>
    </DashboardLayout>
  );
}
```

### Example: Teacher Dashboard

```tsx
import { DashboardLayout } from "@/layout";

export default function TeacherDashboard() {
  return (
    <DashboardLayout title="My Courses">
      <div className="p-6">{/* Teacher-specific content */}</div>
    </DashboardLayout>
  );
}
```

### Example: Student Dashboard

```tsx
import { DashboardLayout } from "@/layout";

export default function StudentDashboard() {
  return (
    <DashboardLayout title="My Schedule">
      <div className="p-6">{/* Student-specific content */}</div>
    </DashboardLayout>
  );
}
```

## Components

### DashboardLayout

Main wrapper component that provides the complete layout.

**Props:**

- `children`: React nodes to render in the main content area
- `title?`: Page title displayed in the top bar (default: "Dashboard")

### TopBar

Top navigation bar with sidebar trigger and action buttons.

**Props:**

- `title?`: Page title (default: "Dashboard")

### AppSidebar

Configurable sidebar component.

**Props:**

- `config`: Dashboard configuration object
- All `Sidebar` component props from shadcn/ui

## Navigation Components

### NavMain

Primary navigation items.

### NavSecondary

Secondary navigation items (typically Settings, Help).

### NavDocuments

Quick links section with dropdown actions.

### NavUser

User profile dropdown with logout functionality.

## Styling

The layout uses CSS variables for customization:

```tsx
<SidebarProvider
  style={{
    "--sidebar-width": "16rem",
    "--header-height": "4rem",
  }}
>
```

Modify these values in `DashboardLayout.tsx` to adjust dimensions.

## Adding New Roles

1. Add your role type to `UserRole` in `dashboard.config.ts`:

```typescript
export type UserRole = "admin" | "teacher" | "student" | "parent";
```

2. Create a configuration object:

```typescript
const parentConfig: Omit<DashboardConfig, "user"> = {
  companyName: "Parent Portal",
  companyLogo: IconUsers,
  navMain: [...],
  navSecondary: [...],
};
```

3. Add to the configs object in `getDashboardConfig`:

```typescript
const configs = {
  admin: adminConfig,
  teacher: teacherConfig,
  student: studentConfig,
  parent: parentConfig,
};
```

## Icons

Icons are from `@tabler/icons-react`. Available icons include:

- `IconDashboard`
- `IconUsers`
- `IconBook`
- `IconCalendar`
- `IconSettings`
- And many more...

Browse all icons at: https://tabler-icons.io/

## Tips

1. **Keep navigation simple**: Don't overload the sidebar with too many items
2. **Use badges**: Highlight new features or counts with badges
3. **Consistent URLs**: Follow a pattern like `/{role}/{feature}`
4. **Icons matter**: Choose clear, recognizable icons for navigation items
5. **Test all roles**: Ensure each role's navigation makes sense for that user type

## Troubleshooting

**Layout not showing:**

- Ensure user is logged in via `AuthContext`
- Check that user object has a valid `role` property

**Navigation not updating:**

- Clear browser cache
- Verify role is correctly set in user object

**Icons not displaying:**

- Install `@tabler/icons-react`: `npm install @tabler/icons-react`

## Dependencies

Required shadcn/ui components:

- sidebar
- button
- separator
- avatar
- dropdown-menu
- badge

Additional dependencies:

- `@tabler/icons-react`
