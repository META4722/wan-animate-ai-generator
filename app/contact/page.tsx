"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, Phone, MapPin, MessageSquare } from "lucide-react";

export default function ContactPage() {

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container px-4 md:px-6 py-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm" className="gap-2">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold">Contact Us</h1>
              <p className="text-sm text-muted-foreground">
                Get in touch with our support team
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container px-4 md:px-6 py-16">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-6"
          >
            <div className="inline-flex items-center rounded-full px-3 py-1 text-sm bg-primary/10 text-primary mb-4">
              <MessageSquare className="mr-2 h-4 w-4" />
              We're Here to Help
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Contact Us
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Have questions about Wanimate AI? Need technical support? Want to discuss enterprise solutions? 
              We'd love to hear from you and help you create amazing animations.
            </p>
          </motion.div>

          {/* Contact Methods */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid gap-6 md:grid-cols-2"
          >
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Email Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-3">
                  Get help with technical issues, billing, or general questions.
                </p>
                <a 
                  href="mailto:support@wanimate.io" 
                  className="text-primary hover:underline font-medium"
                >
                  support@wanimate.io
                </a>
              </CardContent>
            </Card>



            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Phone Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-3">
                  Speak directly with our technical support team.
                </p>
                <a 
                  href="tel:+44-07871838925" 
                  className="text-primary hover:underline font-medium"
                >
                  +44 07871838925
                </a>
              </CardContent>
            </Card>


          </motion.div>

          <div className="max-w-2xl mx-auto">
            {/* Company Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="space-y-8"
            >
              {/* Company Details */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <MapPin className="h-6 w-6 text-primary" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Wan Animate Inc.</h4>
                    <p className="text-muted-foreground text-sm">
                      Leading AI-powered video animation platform
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Address</h4>
                    <p className="text-muted-foreground text-sm">
                      Shanghai, China<br />
                      People's Republic of China
                    </p>
                  </div>


                </CardContent>
              </Card>




            </motion.div>
          </div>


        </div>
      </div>
    </div>
  );
}