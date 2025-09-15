"use client";

import React, { useState } from 'react';
import { Search, Filter, Heart, Download, Eye } from 'lucide-react';

export default function GalleryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Sample gallery data
  const galleryItems = [
    {
      id: 1,
      title: 'Modern Villa Rendering',
      category: 'exterior',
      style: 'Realistic',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
      likes: 234,
      views: 1500,
      author: 'Alex Chen'
    },
    {
      id: 2,
      title: 'Minimalist Interior',
      category: 'interior',
      style: 'Modern',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
      likes: 189,
      views: 980,
      author: 'Sarah Kim'
    },
    {
      id: 3,
      title: 'Night Scene Architecture',
      category: 'exterior',
      style: 'Night',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop',
      likes: 412,
      views: 2300,
      author: 'Mike Johnson'
    },
    {
      id: 4,
      title: 'Sketch to Reality',
      category: 'sketch',
      style: 'Realistic',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop',
      likes: 156,
      views: 750,
      author: 'Emma Wilson'
    },
    {
      id: 5,
      title: 'Industrial Loft Design',
      category: 'interior',
      style: 'Industrial',
      image: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=400&h=300&fit=crop',
      likes: 298,
      views: 1200,
      author: 'David Lee'
    },
    {
      id: 6,
      title: 'Elevation Study',
      category: 'elevation',
      style: 'Realistic',
      image: 'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=400&h=300&fit=crop',
      likes: 167,
      views: 890,
      author: 'Lisa Zhang'
    }
  ];

  const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 'text', label: 'Text to Render' },
    { id: 'sketch', label: 'Sketch to Render' },
    { id: 'elevation', label: 'Elevation to Render' },
    { id: 'exterior', label: 'Exterior Design' },
    { id: 'interior', label: 'Interior Design' }
  ];

  const filteredItems = galleryItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || item.category === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
              Gallery
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover amazing AI-powered architectural renderings created by our community
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search by title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
            />
          </div>

          {/* Filter */}
          <div className="sm:w-64">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 appearance-none cursor-pointer"
              >
                {filterOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-card backdrop-blur-xl rounded-2xl shadow-xl border border-border overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Overlay actions */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                    <Heart className="w-4 h-4 text-gray-700" />
                  </button>
                  <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                    <Download className="w-4 h-4 text-gray-700" />
                  </button>
                </div>

                {/* Style badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                    {item.style}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <h3 className="font-semibold text-foreground text-sm line-clamp-2">
                  {item.title}
                </h3>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>by {item.author}</span>
                  <span className="capitalize">{item.category}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {item.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {item.views}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No results found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}