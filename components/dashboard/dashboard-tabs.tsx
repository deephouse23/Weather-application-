'use client'

/**
 * 16-Bit Weather Platform - BETA v0.3.2
 * 
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 * 
 * Use Limitation: 5 users
 * See LICENSE file for full terms
 * 
 * BETA SOFTWARE NOTICE:
 * This software is in active development. Features may change.
 * Report issues: https://github.com/deephouse23/Weather-application-/issues
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { MapPin, Star, Plus, Settings, Grid, List, Sun, Cloud, Snowflake } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils'
import LocationCard from '@/components/dashboard/location-card'
import ThemeSelectorGrid from '@/components/dashboard/theme-selector-grid'
import { SavedLocation } from '@/lib/supabase/types'

type Location = SavedLocation

interface DashboardTabsProps {
  locations: Location[]
  loading: boolean
  onAddLocation: () => void
  onLocationUpdate: () => void
}

export default function DashboardTabs({
  locations,
  loading,
  onAddLocation,
  onLocationUpdate
}: DashboardTabsProps) {
  const { theme } = useTheme()
  const themeClasses = getComponentStyles(theme as ThemeType, 'dashboard')
  
  const favoriteLocations = locations.filter(loc => loc.is_favorite)
  const allLocations = locations

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <Tabs defaultValue="favorites" className="w-full">
      <TabsList className={cn(
        "grid w-full grid-cols-3 mb-8",
        "border-2",
        themeClasses.borderColor
      )}>
        <TabsTrigger 
          value="favorites"
          className={cn(
            "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
            "font-mono uppercase tracking-wider"
          )}
        >
          <Star className="w-4 h-4 mr-2" />
          Favorites ({favoriteLocations.length})
        </TabsTrigger>
        <TabsTrigger 
          value="all"
          className={cn(
            "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
            "font-mono uppercase tracking-wider"
          )}
        >
          <MapPin className="w-4 h-4 mr-2" />
          All Locations ({allLocations.length})
        </TabsTrigger>
        <TabsTrigger 
          value="themes"
          className={cn(
            "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
            "font-mono uppercase tracking-wider"
          )}
        >
          <Settings className="w-4 h-4 mr-2" />
          Themes
        </TabsTrigger>
      </TabsList>

      {/* Favorites Tab */}
      <TabsContent value="favorites" className="space-y-4">
        {favoriteLocations.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Star className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold uppercase tracking-wider font-mono mb-4">
                No Favorite Locations
              </h3>
              <p className="text-sm font-mono mb-6 text-muted-foreground">
                Mark locations as favorites for quick access
              </p>
              <Button
                onClick={onAddLocation}
                className="font-mono uppercase tracking-wider"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Location
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteLocations.map((location) => (
              <LocationCard
                key={location.id}
                location={location}
                onUpdate={onLocationUpdate}
              />
            ))}
          </div>
        )}
      </TabsContent>

      {/* All Locations Tab */}
      <TabsContent value="all" className="space-y-4">
        {allLocations.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold uppercase tracking-wider font-mono mb-4">
                No Saved Locations
              </h3>
              <p className="text-sm font-mono mb-6 text-muted-foreground">
                Start by adding your favorite weather locations to track
              </p>
              <Button
                onClick={onAddLocation}
                className="font-mono uppercase tracking-wider"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Location
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allLocations.map((location) => (
              <LocationCard
                key={location.id}
                location={location}
                onUpdate={onLocationUpdate}
              />
            ))}
          </div>
        )}
      </TabsContent>

      {/* Themes Tab */}
      <TabsContent value="themes" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-mono uppercase tracking-wider">
              Select Your Theme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ThemeSelectorGrid />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-mono uppercase tracking-wider">
              Theme Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <Sun className="w-12 h-12 mx-auto mb-2 text-primary" />
                <Badge>Sunny</Badge>
              </div>
              <div className="text-center">
                <Cloud className="w-12 h-12 mx-auto mb-2 text-primary" />
                <Badge variant="secondary">Cloudy</Badge>
              </div>
              <div className="text-center">
                <Snowflake className="w-12 h-12 mx-auto mb-2 text-primary" />
                <Badge variant="outline">Snowy</Badge>
              </div>
            </div>
            
            <div className="p-4 border-2 border-primary">
              <p className="font-mono text-sm">
                Current theme: <span className="text-primary uppercase">{theme}</span>
              </p>
              <p className="font-mono text-xs text-muted-foreground mt-2">
                Each theme provides a unique 16-bit aesthetic inspired by retro gaming terminals.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}