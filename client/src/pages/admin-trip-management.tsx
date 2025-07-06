import { AdminTripManager } from "@/components/admin-trip-manager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Users, MapPin } from "lucide-react";
import { Link } from "wouter";

export default function AdminTripManagement() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin/felixdgreat/console">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Console</span>
                </Button>
              </Link>
              <div className="h-6 w-px bg-slate-300"></div>
              <h1 className="text-xl font-semibold text-slate-900">Trip Management</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Total Trips</p>
                    <p className="text-2xl font-semibold text-slate-900">Active Management</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Customer Profiles</p>
                    <p className="text-2xl font-semibold text-slate-900">Synchronized</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Smart Check-ins</p>
                    <p className="text-2xl font-semibold text-slate-900">Context-Aware</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <AdminTripManager />

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">How Trip Management Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Smart Daily Check-ins</h4>
                <p className="text-sm text-slate-600 mb-4">
                  When you set accurate trip dates and destinations, the system automatically generates 
                  intelligent daily check-in questions based on where customers should be on any given day.
                </p>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Active trip days: "How is your Paris experience going? (Day 3 of 10)"</li>
                  <li>• Pre-trip: "How are preparations for Tokyo going? (Departing in 2 days)"</li>
                  <li>• Context-aware location detection</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Customer Experience</h4>
                <p className="text-sm text-slate-600 mb-4">
                  Customers receive personalized support without needing to manage their own trip details. 
                  The system knows their itinerary and provides relevant assistance.
                </p>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• No manual date entry required</li>
                  <li>• Automatic location-based questions</li>
                  <li>• Seamless support experience</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}