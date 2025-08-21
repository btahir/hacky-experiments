"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
	Upload,
	Download,
	Mic,
	Video,
	AlertCircle,
	CheckCircle2,
	AlertTriangle,
	Wand2
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface ProcessingResult {
	videoUrl: string | null;
	audioUrl: string;
	processingTime: number;
	message?: string;
	partialSuccess?: boolean;
	error?: string;
}

export default function VoiceMorphClient() {
	const [videoFile, setVideoFile] = useState<File | null>(null);
	const [audioFile, setAudioFile] = useState<File | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [progress, setProgress] = useState(0);
	const [result, setResult] = useState<ProcessingResult | null>(null);
	const [error, setError] = useState<string | null>(null);

	const videoInputRef = useRef<HTMLInputElement>(null);
	const audioInputRef = useRef<HTMLInputElement>(null);



	const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			if (!file.type.startsWith('video/')) {
				toast.error("Please select a valid video file");
				return;
			}
			setVideoFile(file);
			setError(null);
			toast.success("Video uploaded successfully!");
		}
	};

	const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			if (!file.type.startsWith('audio/')) {
				toast.error("Please select a valid audio file");
				return;
			}
			setAudioFile(file);
			setError(null);
			toast.success("Audio uploaded successfully!");
		}
	};

	const processFiles = async () => {
		if (!videoFile || !audioFile) {
			toast.error("Please upload both video and audio files");
			return;
		}

		setIsProcessing(true);
		setProgress(0);
		setError(null);

		try {
			const formData = new FormData();
			formData.append('video', videoFile);
			formData.append('audio', audioFile);

			// Simulate progress updates
			const progressInterval = setInterval(() => {
				setProgress(prev => {
					if (prev >= 90) return prev;
					return prev + Math.random() * 10;
				});
			}, 500);

			const response = await fetch('/api/voice-morph/process', {
				method: 'POST',
				body: formData,
			});

			clearInterval(progressInterval);

			if (!response.ok && response.status !== 207) {
				const errorText = await response.text();
				throw new Error(`Processing failed: ${response.status} ${errorText}`);
			}

			const resultData = await response.json();
			setProgress(100);
			setResult(resultData);

			// Handle partial success (status 207)
			if (response.status === 207 || resultData.partialSuccess) {
				toast.warning("Voice conversion completed, but video merge failed. Check results below.");
			} else {
				toast.success("Voice morphing completed successfully!");
			}

		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
			toast.error("Processing failed. Please try again.");
		} finally {
			setIsProcessing(false);
		}
	};

	const resetFiles = () => {
		setVideoFile(null);
		setAudioFile(null);
		setResult(null);
		setError(null);
		setProgress(0);
		if (videoInputRef.current) videoInputRef.current.value = '';
		if (audioInputRef.current) audioInputRef.current.value = '';
	};

	return (
		<main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
			{/* Animated background elements */}
			<div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
				<div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse" />
				<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
			</div>

			<div className="relative z-20 py-8 px-4">
				<div className="max-w-5xl mx-auto">
					{/* Header */}
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, ease: "easeOut" }}
						className="text-center mb-16"
					>
						<motion.h1
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.4 }}
							className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6 leading-tight"
						>
							VoiceMorph Studio
						</motion.h1>

						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.6 }}
							className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium"
						>
							Transform any video by replacing its audio with a target voice using advanced AI speech-to-speech conversion
						</motion.p>
					</motion.div>

					{/* Upload Section */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.1 }}
					>
						<Card className="mb-8">
							<CardHeader>
								<CardTitle className="flex items-center gap-3">
									<Upload className="w-5 h-5" />
									Upload Files
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-6">
								{/* Video Upload */}
								<div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
									<Video className="w-12 h-12 mx-auto mb-4 text-gray-400" />
									<h3 className="text-lg font-semibold mb-2">Source Video</h3>
									<p className="text-gray-600 mb-4">
										Upload the video you want to modify
									</p>
									<input
										ref={videoInputRef}
										type="file"
										accept="video/*"
										onChange={handleVideoUpload}
										className="hidden"
									/>
									<Button
										onClick={() => videoInputRef.current?.click()}
										variant="outline"
										disabled={isProcessing}
										className="mb-3"
									>
										<Upload className="w-4 h-4 mr-2" />
										Choose Video File
									</Button>
									{videoFile && (
										<div className="flex items-center justify-center gap-2">
											<CheckCircle2 className="w-4 h-4 text-green-500" />
											<span className="text-sm text-gray-600">
												{videoFile.name}
											</span>
										</div>
									)}
								</div>

								{/* Audio Upload */}
								<div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
									<Mic className="w-12 h-12 mx-auto mb-4 text-gray-400" />
									<h3 className="text-lg font-semibold mb-2">Target Voice Audio</h3>
									<p className="text-gray-600 mb-4">
										Upload the audio file containing the target voice you want to use
									</p>
									<input
										ref={audioInputRef}
										type="file"
										accept="audio/*"
										onChange={handleAudioUpload}
										className="hidden"
									/>
									<Button
										onClick={() => audioInputRef.current?.click()}
										variant="outline"
										disabled={isProcessing}
										className="mb-3"
									>
										<Upload className="w-4 h-4 mr-2" />
										Choose Audio File
									</Button>
									{audioFile && (
										<div className="flex items-center justify-center gap-2">
											<CheckCircle2 className="w-4 h-4 text-green-500" />
											<span className="text-sm text-gray-600">
												{audioFile.name}
											</span>
										</div>
									)}
								</div>


							</CardContent>
						</Card>
					</motion.div>

					{/* Processing Section */}
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.3 }}
						className="mb-16"
					>
						<div className="text-center mb-8">
							<h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
								Ready to Transform
							</h2>
							<p className="text-slate-600 text-lg">
								Click the magic button to start voice morphing
							</p>
						</div>

						<div className="flex flex-col items-center space-y-6">
							<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
								{/* Main Action Button */}
								<motion.div
									whileHover={!isProcessing && videoFile && audioFile ? { scale: 1.05 } : {}}
									whileTap={!isProcessing && videoFile && audioFile ? { scale: 0.95 } : {}}
									className="relative"
								>
									<Button
										onClick={processFiles}
										disabled={!videoFile || !audioFile || isProcessing}
										size="lg"
										className={`relative px-8 py-6 text-lg font-semibold transition-all duration-300 touch-manipulation ${isProcessing
											? 'bg-slate-400 cursor-not-allowed'
											: videoFile && audioFile
												? 'bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:scale-95'
												: 'bg-slate-300 cursor-not-allowed'
											}`}
									>
										{isProcessing ? (
											<motion.div
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												className="flex items-center gap-3"
											>
												<motion.div
													animate={{ rotate: 360 }}
													transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
													className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
												/>
												<span>Transforming Your Video...</span>
											</motion.div>
										) : (
											<motion.div
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												className="flex items-center gap-3"
											>
												<Wand2 className="w-5 h-5" />
												<span>Start Voice Morphing</span>
											</motion.div>
										)}
									</Button>

									{/* Pulsing ring animation when ready */}
									{videoFile && audioFile && !isProcessing && (
										<motion.div
											initial={{ scale: 1, opacity: 0.5 }}
											animate={{ scale: 1.2, opacity: 0 }}
											transition={{ duration: 1.5, repeat: Infinity }}
											className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 pointer-events-none"
										/>
									)}
								</motion.div>

								{/* Reset Button */}
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: 0.2 }}
								>
									<Button
										onClick={resetFiles}
										variant="outline"
										disabled={isProcessing}
										size="lg"
										className="p-6 border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all duration-300"
									>
										Reset Files
									</Button>
								</motion.div>
							</div>

							{/* Progress Section */}
							{isProcessing && (
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.6 }}
									className="w-full max-w-md space-y-4"
								>
									<div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
										<div className="flex items-center justify-between mb-3">
											<div className="flex items-center gap-3">
												<div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
													<Wand2 className="w-4 h-4 text-white" />
												</div>
												<span className="font-semibold text-slate-800">Processing Your Files</span>
											</div>
											<span className="text-lg font-bold text-purple-600">{Math.round(progress)}%</span>
										</div>

										<div className="space-y-3">
											<Progress value={progress} className="h-3 bg-slate-200" />

											<div className="text-center">
												<p className="text-sm text-slate-600">
													{progress < 30 ? "Extracting audio from video..." :
														progress < 70 ? "Transforming voice with AI..." :
															progress < 90 ? "Merging audio with video..." :
																"Finalizing your voice-morphed video..."}
												</p>
												<p className="text-xs text-slate-500 mt-1">
													This usually takes 2-4 minutes depending on file sizes
												</p>
											</div>
										</div>
									</div>
								</motion.div>
							)}
						</div>
					</motion.div>

					{/* Error Display */}
					{error && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4 }}
							className="mb-8"
						>
							<div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-lg">
								<div className="flex items-start gap-4">
									<div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
										<AlertCircle className="w-5 h-5 text-red-600" />
									</div>
									<div className="flex-1">
										<h4 className="text-lg font-semibold text-red-800 mb-2">
											Processing Error
										</h4>
										<p className="text-red-700 leading-relaxed">
											{error}
										</p>
										<div className="mt-4">
											<Button
												onClick={() => window.location.reload()}
												size="sm"
												variant="outline"
												className="border-red-300 text-red-700 hover:bg-red-50"
											>
												Try Again
											</Button>
										</div>
									</div>
								</div>
							</div>
						</motion.div>
					)}

					{/* Results Section */}
					{result && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.3 }}
						>
							<Card className="border-green-200">
								<CardHeader>
									<CardTitle className="flex items-center gap-3 text-green-600">
										<CheckCircle2 className="w-5 h-5" />
										Processing Complete!
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-6">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										{/* Original Files */}
										<div>
											<h4 className="font-semibold mb-3">Original Files</h4>
											<div className="space-y-3">
												<div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
													<Video className="w-4 h-4 text-gray-600" />
													<div>
														<p className="text-sm font-medium">{videoFile?.name}</p>
														<p className="text-xs text-gray-600">Source Video</p>
													</div>
												</div>
												<div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
													<Mic className="w-4 h-4 text-gray-600" />
													<div>
														<p className="text-sm font-medium">{audioFile?.name}</p>
														<p className="text-xs text-gray-600">Target Voice Audio</p>
													</div>
												</div>
											</div>
										</div>

										{/* Results */}
										<div>
											<h4 className="font-semibold mb-3">Results</h4>
											<div className="space-y-3">
												<div className="flex flex-wrap items-center gap-2">
													<Badge variant="outline" className="text-green-600 border-green-300">
														Processing Time: {(result.processingTime / 1000).toFixed(1)}s
													</Badge>
													<motion.div
														initial={{ scale: 0 }}
														animate={{ scale: 1 }}
														transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
														className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
													>
														<CheckCircle2 className="w-4 h-4" />
														Processing Complete!
													</motion.div>
													{result.partialSuccess && (
														<Badge variant="outline" className="text-orange-600 border-orange-300">
															⚠️ Partial Success - Audio Only
														</Badge>
													)}
												</div>
												{/* Video Preview */}
												<motion.div
													initial={{ opacity: 0, scale: 0.9 }}
													animate={{ opacity: 1, scale: 1 }}
													transition={{ duration: 0.6, delay: 0.2 }}
													className="space-y-6"
												>

													{result.videoUrl ? (
														<div className="relative group">
															<div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
															<div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
																<video
																	controls
																	className="w-full h-auto max-h-[500px] object-contain"
																	preload="metadata"
																>
																	<source src={result.videoUrl} type="video/mp4" />
																	Your browser does not support the video tag.
																</video>
															</div>
														</div>
													) : (
														<div className="relative bg-gradient-to-r from-orange-100 to-yellow-100 rounded-2xl p-8 text-center">
															<div className="text-orange-600 mb-4">
																<AlertTriangle className="w-12 h-12 mx-auto" />
															</div>
															<h3 className="text-lg font-semibold text-orange-800 mb-2">
																Video Merge Failed
															</h3>
															<p className="text-orange-700">
																The voice conversion was successful, but we couldn&apos;t merge the audio with your video.
																You can download the processed audio below and merge it manually with your video.
															</p>
														</div>
													)}

													<div className="text-center">
														<p className="text-lg font-medium text-slate-700 mb-2">
															{result.videoUrl ? "🎬 Your Voice-Morphed Video" : "🎵 Your Processed Audio"}
														</p>
														<p className="text-slate-600 text-sm">
															{result.videoUrl
																? "The audio has been successfully transformed while preserving the original video quality"
																: "The voice conversion was successful! Download the processed audio below."
															}
														</p>
													</div>
												</motion.div>

												{/* Download Section */}
												<motion.div
													initial={{ opacity: 0, y: 20 }}
													animate={{ opacity: 1, y: 0 }}
													transition={{ duration: 0.6, delay: 0.4 }}
													className="space-y-4"
												>
													<div className="text-center">
														<h4 className="text-lg font-semibold text-slate-800 mb-2">
															Download Your Results
														</h4>
														<p className="text-slate-600 text-sm">
															Save your transformed video or download just the processed audio
														</p>
													</div>

													<div className={`grid gap-4 ${result.videoUrl ? 'sm:grid-cols-2' : 'sm:grid-cols-1 max-w-md mx-auto'}`}>
														{result.videoUrl && (
															<motion.div
																whileHover={{ scale: 1.02 }}
																whileTap={{ scale: 0.98 }}
															>
																<Button
																	asChild
																	size="lg"
																	className="w-full h-14 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
																>
																	<a href={result.videoUrl} download="voice-morphed-video.mp4" target="_blank">
																		<div className="flex items-center justify-center gap-2">
																			<Download className="w-5 h-5" />
																			<span>Full Video</span>
																		</div>
																		<div className="text-xs opacity-90 mt-1">
																			(with new voice)
																		</div>
																	</a>
																</Button>
															</motion.div>
														)}

														<motion.div
															whileHover={{ scale: 1.02 }}
															whileTap={{ scale: 0.98 }}
														>
															<Button
																asChild
																size="lg"
																variant="outline"
																className="w-full h-14 border-2 border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-300"
															>
																<a href={result.audioUrl} download="processed-audio.wav" target="_blank">
																	<div className="flex items-center justify-center gap-2">
																		<Mic className="w-5 h-5" />
																		<span>Audio Only</span>
																	</div>
																	<div className="text-xs opacity-70 mt-1">
																		(processed voice)
																	</div>
																</a>
															</Button>
														</motion.div>
													</div>
												</motion.div>
											</div>
										</div>
									</div>

									<Separator />

									<div className="text-center">
										<p className="text-sm text-gray-600 mb-4">
											{result.videoUrl
												? "🎉 Your voice-morphed video is ready! Preview it above or download to save. The audio has been successfully replaced using ChatterboxHD AI while preserving the original video quality."
												: "🎉 Your voice conversion is ready! The audio has been successfully transformed using ChatterboxHD AI. Download the processed audio above."
											}
										</p>
										<Button onClick={resetFiles} variant="outline">
											Create Another Video
										</Button>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					)}
				</div>
			</div>
		</main>
	);
}
