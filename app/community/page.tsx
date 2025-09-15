"use client";

import React, { useState } from 'react';
import { MessageCircle, Users, Trophy, TrendingUp, Heart, Share2, MessageSquare, Star, Award } from 'lucide-react';

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState('trending');

  // Sample community posts
  const communityPosts = [
    {
      id: 1,
      type: 'showcase',
      author: {
        name: 'Alex Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
        level: 'Pro Designer',
        verified: true
      },
      title: 'Just finished this amazing modern villa render!',
      content: 'Used the new Night style feature and I\'m absolutely blown away by the results. The AI really captured the mood perfectly.',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500&h=300&fit=crop',
      likes: 234,
      comments: 45,
      shares: 12,
      timeAgo: '2 hours ago',
      tags: ['Night Style', 'Exterior Design', 'Modern Architecture']
    },
    {
      id: 2,
      type: 'tutorial',
      author: {
        name: 'Sarah Kim',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b372?w=40&h=40&fit=crop&crop=face',
        level: 'Community Expert',
        verified: true
      },
      title: 'Tips for better prompt engineering in architectural rendering',
      content: '5 key techniques I\'ve learned after generating 500+ renders: 1) Be specific about lighting conditions, 2) Include material details, 3) Mention architectural style explicitly...',
      likes: 189,
      comments: 67,
      shares: 34,
      timeAgo: '6 hours ago',
      tags: ['Tutorial', 'Tips', 'Prompt Engineering']
    },
    {
      id: 3,
      type: 'discussion',
      author: {
        name: 'Mike Johnson',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        level: 'Rising Star',
        verified: false
      },
      title: 'What\'s your favorite rendering style and why?',
      content: 'I\'ve been experimenting with different styles lately. Realistic gives great results but I\'m really loving the Snow style for winter projects. What about you?',
      likes: 98,
      comments: 156,
      shares: 8,
      timeAgo: '12 hours ago',
      tags: ['Discussion', 'Styles', 'Community Question']
    },
    {
      id: 4,
      type: 'showcase',
      author: {
        name: 'Emma Wilson',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
        level: 'Architect',
        verified: true
      },
      title: 'Before vs After: Sketch to Reality transformation',
      content: 'Started with a rough hand sketch and used Sketch to Render. The AI interpreted my design intent perfectly!',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=500&h=300&fit=crop',
      likes: 412,
      comments: 89,
      shares: 56,
      timeAgo: '1 day ago',
      tags: ['Sketch to Render', 'Transformation', 'Architecture']
    }
  ];

  // Community stats
  const communityStats = [
    { label: 'Active Users', value: '12.5K', icon: Users, color: 'text-blue-500' },
    { label: 'Renders Created', value: '245K', icon: TrendingUp, color: 'text-green-500' },
    { label: 'Community Posts', value: '8.2K', icon: MessageCircle, color: 'text-purple-500' },
    { label: 'Awards Given', value: '1.8K', icon: Trophy, color: 'text-yellow-500' }
  ];

  // Top contributors
  const topContributors = [
    { name: 'Alex Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face', points: 2840, badge: 'Master' },
    { name: 'Sarah Kim', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b372?w=40&h=40&fit=crop&crop=face', points: 2156, badge: 'Expert' },
    { name: 'David Lee', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face', points: 1892, badge: 'Pro' }
  ];

  const tabs = [
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'recent', label: 'Recent', icon: MessageCircle },
    { id: 'tutorials', label: 'Tutorials', icon: Star }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
              Community
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Connect with fellow designers, share your creations, and learn from the best
            </p>
          </div>
        </div>
      </div>

      {/* Community Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {communityStats.map((stat, index) => (
            <div key={index} className="bg-card backdrop-blur-xl rounded-xl shadow-lg border border-border p-4 text-center">
              <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-muted p-1 rounded-lg">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                    ${activeTab === tab.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                    }
                  `}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Posts */}
            <div className="space-y-6">
              {communityPosts.map((post) => (
                <div key={post.id} className="bg-card backdrop-blur-xl rounded-2xl shadow-xl border border-border p-6">
                  {/* Post Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{post.author.name}</h3>
                        {post.author.verified && (
                          <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                            <Star className="w-2 h-2 text-primary-foreground fill-current" />
                          </div>
                        )}
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {post.author.level}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">{post.timeAgo}</div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-foreground">{post.title}</h2>
                    <p className="text-muted-foreground">{post.content}</p>

                    {/* Post Image */}
                    {post.image && (
                      <div className="rounded-xl overflow-hidden">
                        <img
                          src={post.image}
                          alt="Post content"
                          className="w-full h-64 object-cover"
                        />
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Post Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-6">
                        <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                          <Heart className="w-5 h-5" />
                          <span className="text-sm">{post.likes}</span>
                        </button>
                        <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                          <MessageSquare className="w-5 h-5" />
                          <span className="text-sm">{post.comments}</span>
                        </button>
                        <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                          <Share2 className="w-5 h-5" />
                          <span className="text-sm">{post.shares}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 space-y-6">
            {/* Top Contributors */}
            <div className="bg-card backdrop-blur-xl rounded-2xl shadow-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Top Contributors
              </h3>
              <div className="space-y-4">
                {topContributors.map((contributor, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={contributor.avatar}
                        alt={contributor.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-foreground">{contributor.name}</div>
                      <div className="text-sm text-muted-foreground">{contributor.points} points</div>
                    </div>
                    <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {contributor.badge}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Guidelines */}
            <div className="bg-card backdrop-blur-xl rounded-2xl shadow-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Community Guidelines</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div>" Be respectful and constructive</div>
                <div>" Share your original work</div>
                <div>" Provide helpful feedback</div>
                <div>" Credit inspiration sources</div>
                <div>" Keep content relevant to architecture</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}