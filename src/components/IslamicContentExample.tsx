import React from 'react'
import QuranText from './QuranText'
import { ComponentErrorBoundary } from './ErrorBoundary'
// import { useIslamicContentStore } from '../stores/islamicContentStore'

/**
 * Example component demonstrating usage of the Islamic Content Store
 * This shows how to integrate Hadith, Duas, and Prayer Times functionality
 */
const IslamicContentExample: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        Arabic Text Display Examples
      </h1>

      {/* Bismillah Examples */}
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        <h2 className="text-xl font-semibold mb-4">Bismillah Examples</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Large Bismillah</h3>
            <QuranText
              text="بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم"
              style="bismillah"
              size="large"
              className="text-primary-700 dark:text-gold-400"
            />
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Medium Bismillah</h3>
            <QuranText
              text="بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم"
              style="bismillah"
              size="medium"
              className="text-primary-600 dark:text-gold-300"
            />
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Small Bismillah</h3>
            <QuranText
              text="بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم"
              style="bismillah"
              size="small"
              className="text-gray-700 dark:text-gray-300"
            />
          </div>
        </div>
      </div>

      {/* Quran Text Examples */}
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        <h2 className="text-xl font-semibold mb-4">Quran Text Examples</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Large Quran Text</h3>
            <QuranText
              text="الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ"
              size="large"
              showAyahNumber={true}
              ayahNumber={2}
              className="text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Medium Quran Text</h3>
            <QuranText
              text="الرَّحْمَنِ الرَّحِيمِ"
              size="medium"
              showAyahNumber={true}
              ayahNumber={3}
              className="text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Small Quran Text</h3>
            <QuranText
              text="مَالِكِ يَوْمِ الدِّينِ"
              size="small"
              showAyahNumber={true}
              ayahNumber={4}
              className="text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Mushaf Style Example */}
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        <h2 className="text-xl font-semibold mb-4">Mushaf Style Text</h2>
        
        <div>
          <QuranText
            text="إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ"
            style="mushaf"
            showAyahNumber={true}
            ayahNumber={5}
            className="text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Interactive Examples */}
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        <h2 className="text-xl font-semibold mb-4">Interactive Examples</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Highlighted Text</h3>
            <QuranText
              text="اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ"
              size="medium"
              isHighlighted={true}
              showAyahNumber={true}
              ayahNumber={6}
              className="text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Playing Text</h3>
            <QuranText
              text="صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ"
              size="medium"
              isPlaying={true}
              showAyahNumber={true}
              ayahNumber={7}
              className="text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="text-center text-gray-500 text-sm">
        <p>All Arabic text is displayed with proper RTL direction and authentic fonts</p>
      </div>
    </div>
  )
}

// Wrap IslamicContentExample with error boundary
const IslamicContentExampleWithErrorBoundary: React.FC = () => (
  <ComponentErrorBoundary 
    componentName="Islamic Content"
    enableGracefulDegradation={true}
  >
    <IslamicContentExample />
  </ComponentErrorBoundary>
)

export default IslamicContentExampleWithErrorBoundary