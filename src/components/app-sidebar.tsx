'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Search,
  Users,
  Sparkles,
  BarChart3,
  Settings,
  Youtube,
  MessageCircle,
} from 'lucide-react';
import { AppLogo } from './app-logo';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/keyword-research', icon: Search, label: 'Keyword Research' },
  { href: '/competitor-analysis', icon: Users, label: 'Competitor Analysis' },
  { href: '/ai-tools', icon: Sparkles, label: 'AI Content Tools' },
  { href: '/ai-assistant', icon: MessageCircle, label: 'AI Assistant' },
  { href: '/channel-analyzer', icon: BarChart3, label: 'Channel Analyzer' },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();

  return (
    <>
      <SidebarHeader>
        <div
          className={cn(
            'flex items-center gap-2',
            state === 'collapsed' && 'justify-center'
          )}
        >
          <Youtube className="size-8 text-primary" />
          <span
            className={cn(
              'font-bold text-lg',
              state === 'collapsed' && 'hidden'
            )}
          >
            TubeTrend AI
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href)}
                  tooltip={item.label}
                >
                  <div className="flex items-center gap-2">
                    <item.icon />
                    <span>{item.label}</span>
                  </div>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/settings">
              <SidebarMenuButton
                isActive={pathname.startsWith('/settings')}
                tooltip="Settings"
              >
                 <div className="flex items-center gap-2">
                  <Settings />
                  <span>Settings</span>
                </div>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
