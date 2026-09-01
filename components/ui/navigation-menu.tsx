'use client';

import * as React from 'react';
import { NavigationMenu as NavigationMenuPrimitive } from 'radix-ui';
import { ChevronDown } from 'lucide-react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    className={cn('relative z-10 flex items-center justify-center', className)}
    {...props}
  >
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>
));
NavigationMenu.displayName = 'NavigationMenu';

const NavigationMenuList = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    className={cn('group flex list-none items-center gap-0.5', className)}
    {...props}
  />
));
NavigationMenuList.displayName = 'NavigationMenuList';

const NavigationMenuItem = NavigationMenuPrimitive.Item;

const navigationMenuTriggerStyle = cva(
  'group inline-flex h-9 w-max items-center justify-center px-3.5 py-2 text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50 bg-transparent'
);

const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    className={cn(navigationMenuTriggerStyle(), 'group', className)}
    {...props}
  >
    {children}
    <ChevronDown
      className="relative top-[1px] ml-1 h-3.5 w-3.5 text-[#9ba8c0] transition-transform duration-200 group-data-[state=open]:rotate-180"
      aria-hidden="true"
    />
  </NavigationMenuPrimitive.Trigger>
));
NavigationMenuTrigger.displayName = 'NavigationMenuTrigger';

const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    className={cn(
      'left-0 top-0 w-full md:absolute md:w-auto',
      'data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out',
      'data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out',
      'data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52',
      'data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52',
      className
    )}
    {...props}
  />
));
NavigationMenuContent.displayName = 'NavigationMenuContent';

const NavigationMenuLink = NavigationMenuPrimitive.Link;

const NavigationMenuViewport = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  /* Wrapper: absolutely below the nav root, centered */
  <div
    style={{
      position: 'absolute',
      left: 0,
      top: '100%',
      display: 'flex',
      justifyContent: 'center',
      width: '100%',
    }}
  >
    <NavigationMenuPrimitive.Viewport
      ref={ref}
      className={cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90',
        className
      )}
      style={{
        position: 'relative',
        marginTop: '8px',
        height: 'var(--radix-navigation-menu-viewport-height)',
        width: 'var(--radix-navigation-menu-viewport-width)',
        overflow: 'hidden',
        borderRadius: '12px',
        border: '1px solid #e2eaff',
        backgroundColor: '#ffffff',
        boxShadow: '0 10px 40px rgba(59,130,246,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        transformOrigin: 'top center',
      }}
      {...props}
    />
  </div>
));
NavigationMenuViewport.displayName = 'NavigationMenuViewport';

const NavigationMenuIndicator = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Indicator
    ref={ref}
    className={cn(
      'top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden',
      'data-[state=visible]:animate-in data-[state=hidden]:animate-out',
      'data-[state=hidden]:fade-out data-[state=visible]:fade-in',
      className
    )}
    {...props}
  >
    <div style={{ position: 'relative', top: '60%', height: 8, width: 8, transform: 'rotate(45deg)', backgroundColor: '#e2eaff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />
  </NavigationMenuPrimitive.Indicator>
));
NavigationMenuIndicator.displayName = 'NavigationMenuIndicator';

export {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
};
