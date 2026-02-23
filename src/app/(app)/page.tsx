'use client';

import { Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Autoplay from 'embla-carousel-autoplay';
import messages from '@/messages.json';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import FloatingLines from '@/components/FloatingLines';
import SplitText from '@/components/SplitText';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen relative">
      <div style={{ width: '100%', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 0 }}>
        <FloatingLines 
          enabledWaves={['top', 'middle', 'bottom']}
          lineCount={18}
          lineDistance={81}
          bendRadius={25.5}
          bendStrength={0}
          interactive={true}
          parallax={true}
        />
      </div>

      {/* Main content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16 z-10 relative pt-24 sm:pt-28">
        <section className="text-center mb-12 max-w-3xl w-full">
          <div className="mb-6">
            <SplitText
              text="Discover Anonymous Feedback"
              className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white tracking-tight mb-4 block w-full drop-shadow-2xl"
              delay={100}
              duration={0.6}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-100px"
              textAlign="center"
              tag="h1"
            />
          </div>
          <div className="mt-4">
            <SplitText
              text="True Feedback - Share your thoughts with complete privacy"
              className="text-lg sm:text-xl lg:text-2xl text-blue-900 leading-relaxed block w-full font-semibold tracking-wide drop-shadow-md"
              delay={50}
              duration={0.6}
              ease="power3.out"
              splitType="words"
              from={{ opacity: 0, y: 30 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-100px"
              textAlign="center"
              tag="p"
            />
          </div>
        </section>

        {/* Carousel for Messages */}
        <Carousel
          plugins={[Autoplay({ delay: 3000 })]}
          className="w-full max-w-md sm:max-w-lg lg:max-w-2xl"
        >
          <CarouselContent>
            {messages.map((message, index) => (
              <CarouselItem key={index} className="p-4">
                <Card 
                  className="border-2 border-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{
                    background: 'linear-gradient(to bottom right, #ffffff 0%, #e8e0f0 30%, #cabadb 70%, #a896c5 100%)',
                  }}
                >
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-800">
                      {message.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-start space-x-4">
                    <Mail className="flex-shrink-0 text-indigo-700 w-6 h-6 mt-1" />
                    <div>
                      <p className="text-gray-700 leading-relaxed">{message.content}</p>
                      <p className="text-xs text-gray-600 mt-2">
                        {message.received}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </main>
    </div>
  );
}
