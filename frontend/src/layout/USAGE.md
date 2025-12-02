# Quick Usage Guide - Role-Based Dashboard Layout

## 🚀 Quick Start

### 1. Import and Use

```tsx
import { DashboardLayout } from "@/layout";

export default function MyPage() {
  return (
    <DashboardLayout title="My Page">
      <div className="p-6">{/* Your content here */}</div>
    </DashboardLayout>
  );
}
```

That's it! The layout will automatically:

- ✅ Show the correct navigation based on user role
- ✅ Display user info in the sidebar
- ✅ Provide a responsive sidebar and top bar
- ✅ Handle logout functionality

## 📋 What Was Created

### Files Created

```
src/
├── layout/
│   ├── DashboardLayout.tsx    ← Main layout wrapper
│   ├── app-sidebar.tsx        ← Sidebar component
│   ├── top-bar.tsx            ← Top bar with search/notifications
│   ├── nav-main.tsx           ← Main navigation
│   ├── nav-secondary.tsx      ← Secondary navigation
│   ├── nav-documents.tsx      ← Quick links
│   ├── nav-user.tsx           ← User menu
│   ├── index.ts               ← Exports
│   ├── README.md              ← Full documentation
│   └── USAGE.md               ← This file
└── config/
    └── dashboard.config.ts    ← Role configurations
```

## 🎭 Role-Based Navigation

### Admin Role

- Dashboard
- Departments
- Students
- Teachers
- Courses
- Schedules
- Analytics

### Teacher Role

- Dashboard
- My Courses
- Students
- Attendance
- Schedule
- Messages

### Student Role

- Dashboard
- My Courses
- Schedule
- Attendance
- Grades
- Messages

## ✏️ Customizing Navigation

Edit `src/config/dashboard.config.ts`:

```typescript
// Add a new nav item for admin
const adminConfig = {
  // ...
  navMain: [
    // existing items...
    {
      title: "New Feature",
      url: "/admin/new-feature",
      icon: IconStar,
      badge: "New", // Optional badge
    },
  ],
};
```

## 🎨 Page Examples

### Simple Page

```tsx
import { DashboardLayout } from "@/layout";

export default function CoursesPage() {
  return (
    <DashboardLayout title="Courses">
      <div className="p-6">
        <h2>My Courses</h2>
      </div>
    </DashboardLayout>
  );
}
```

### With Cards

```tsx
import { DashboardLayout } from "@/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <DashboardLayout title="Dashboard">
      <div className="p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">123</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
```

## 🔧 Common Tasks

### Add a New Role

1. Edit `dashboard.config.ts`:

```typescript
export type UserRole = "admin" | "teacher" | "student" | "parent";

const parentConfig = {
  companyName: "Parent Portal",
  companyLogo: IconUsers,
  navMain: [
    /* items */
  ],
  navSecondary: [
    /* items */
  ],
};

// Update getDashboardConfig
const configs = {
  admin: adminConfig,
  teacher: teacherConfig,
  student: studentConfig,
  parent: parentConfig, // Add new role
};
```

### Change Sidebar Width

Edit `DashboardLayout.tsx`:

```typescript
<SidebarProvider
  style={{
    "--sidebar-width": "18rem", // Change from 16rem
    "--header-height": "4rem",
  }}
>
```

### Add Badge to Nav Item

```typescript
{
  title: "Messages",
  url: "/messages",
  icon: IconMessages,
  badge: "5", // Shows notification badge
}
```

## 📱 Responsive Behavior

- **Desktop**: Full sidebar visible
- **Tablet**: Collapsible sidebar
- **Mobile**: Overlay sidebar (opens with hamburger menu)

## 🎯 Tips

1. **Use consistent URLs**: `/{role}/{feature}` pattern
2. **Keep it simple**: 5-7 main nav items max
3. **Icons matter**: Use clear, recognizable icons
4. **Test all roles**: Verify navigation for each user type

## 🐛 Troubleshooting

**Layout not showing?**

- Check user is logged in
- Verify user.role is set correctly

**Wrong navigation showing?**

- Check user.role value matches config keys
- Clear browser cache

**Icons missing?**

- Install: `npm install @tabler/icons-react`

## 📚 More Info

See `README.md` for complete documentation.

## 🎉 You're Done!

The dashboard layout system is ready to use. Just wrap your pages with `<DashboardLayout>` and the right navigation will appear based on the logged-in user's role!
