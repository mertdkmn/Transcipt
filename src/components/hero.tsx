"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Upload,
  Youtube,
  FileAudio,
  Copy,
  Download,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export default function Hero() {
  const [inputType, setInputType] = useState<"youtube" | "upload">("youtube");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState("summary");
  const [isProcessing, setIsProcessing] = useState(false);
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [speakerLabels, setSpeakerLabels] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleProcess = () => {
    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
    }, 3000);
  };

  return (
    <div className="relative overflow-hidden bg-white">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-70" />

      <div className="relative pt-24 pb-32 sm:pt-32 sm:pb-40">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-8 tracking-tight">
              YouTube & Audio{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Transcript
              </span>{" "}
              Generator
            </h1>

            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Extract and format transcripts from YouTube videos, uploaded
              videos, or audio files with multiple output format options.
            </p>

            {/* Main Input Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 max-w-2xl mx-auto border">
              {/* Input Type Toggle */}
              <div className="flex justify-center mb-6">
                <div className="bg-gray-100 rounded-lg p-1 flex">
                  <button
                    onClick={() => setInputType("youtube")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                      inputType === "youtube"
                        ? "bg-white shadow-sm text-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Youtube className="w-4 h-4" />
                    YouTube URL
                  </button>
                  <button
                    onClick={() => setInputType("upload")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                      inputType === "upload"
                        ? "bg-white shadow-sm text-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    Upload File
                  </button>
                </div>
              </div>

              {/* Input Area */}
              {inputType === "youtube" ? (
                <div className="mb-6">
                  <Input
                    type="url"
                    placeholder="Paste YouTube URL here..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="h-12 text-lg"
                  />
                </div>
              ) : (
                <div className="mb-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept="audio/*,video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <FileAudio className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-700 mb-2">
                        {selectedFile
                          ? selectedFile.name
                          : "Drop your audio or video file here"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Supports MP3, MP4, WAV, M4A and more
                      </p>
                    </label>
                  </div>
                </div>
              )}

              {/* Format Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Output Format
                </label>
                <Select value={outputFormat} onValueChange={setOutputFormat}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">Summary Format</SelectItem>
                    <SelectItem value="notes">Notes Format</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Additional Options */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex items-center justify-between flex-1">
                  <label className="text-sm font-medium text-gray-700">
                    Include Timestamps
                  </label>
                  <Switch
                    checked={includeTimestamps}
                    onCheckedChange={setIncludeTimestamps}
                  />
                </div>
                <div className="flex items-center justify-between flex-1">
                  <label className="text-sm font-medium text-gray-700">
                    Speaker Labels
                  </label>
                  <Switch
                    checked={speakerLabels}
                    onCheckedChange={setSpeakerLabels}
                  />
                </div>
              </div>

              {/* Process Button */}
              <Button
                onClick={handleProcess}
                disabled={
                  isProcessing ||
                  (inputType === "youtube" && !youtubeUrl) ||
                  (inputType === "upload" && !selectedFile)
                }
                className="w-full h-12 text-lg"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  "Generate Transcript"
                )}
              </Button>
            </div>

            {/* Output Format Preview */}
            <div className="bg-gray-50 rounded-2xl p-8 mb-12 max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">
                Choose Your Output Format
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 border-2 border-green-200">
                  <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                    <FileAudio className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-3 text-center">
                    Summary Format
                  </h3>
                  <div className="text-sm text-gray-600 bg-gray-50 rounded p-3">
                    <div className="mb-2">
                      <strong>Key Points:</strong>
                    </div>
                    <div className="mb-1">• Main topic discussion</div>
                    <div className="mb-1">• Important insights shared</div>
                    <div>• Action items mentioned</div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Great for meetings & lectures
                  </p>
                </div>
                <div className="bg-white rounded-lg p-6 border-2 border-purple-200">
                  <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                    <Copy className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-3 text-center">
                    Adjusted Notes
                  </h3>
                  <div className="text-sm text-gray-600 bg-gray-50 rounded p-3">
                    <div className="mb-2">
                      <strong>Topic:</strong> Introduction
                    </div>
                    <div className="mb-2">
                      <strong>Duration:</strong> 2:15
                    </div>
                    <div>
                      <strong>Notes:</strong> Clean, formatted text with proper
                      punctuation and structure.
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Clean text for documentation
                  </p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <Youtube className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">YouTube Support</h3>
                <p className="text-sm text-gray-600">
                  Extract transcripts from any YouTube video
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <FileAudio className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Multiple Formats</h3>
                <p className="text-sm text-gray-600">
                  Support for audio and video files
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <Copy className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Easy Export</h3>
                <p className="text-sm text-gray-600">
                  Copy to clipboard or download as file
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-8 py-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
              >
                Get Started Free
                <ArrowUpRight className="ml-2 w-5 h-5" />
              </Link>

              <Link
                href="#pricing"
                className="inline-flex items-center px-8 py-4 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-lg font-medium"
              >
                View Pricing
              </Link>
            </div>

            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span>Free tier available</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span>Secure processing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
