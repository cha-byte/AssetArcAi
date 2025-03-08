import React from 'react';
import { ArrowRight, BarChart2, CreditCard, Layers, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AssetArcAi = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      {/* Hero Section */}
      <header className="pt-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">AssetArcAi</h1>
          <p className="text-xl text-gray-600">
            Smart Expense Tracking with AI Powered Insights
          </p>

          <div className="flex justify-center mt-8">
            <button 
            onClick={handleGetStarted}
            className="px-6 py-3 bg-indigo-500 text-white rounded-full text-base font-medium hover:bg-indigo-700 transition-all mb-4 inline-flex items-center gap-2">
            Get Started <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="px-8 md:px-16 lg:px-24 py-16 pb-35 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Feature 1 */}
          <div className="bg-gray-50 p-8 rounded-xl">
            <div className="bg-indigo-100 p-3 rounded-lg w-fit mb-4">
              <MessageCircle size={24} className="text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Voice-to-Text Processing</h3>
            <p className="text-gray-600">
              Add expenses using simple voice commands. Our AI understands context and categorizes automatically.
            </p>
          </div>
          
          {/* Feature 2 */}
          <div className="bg-gray-50 p-8 rounded-xl">
            <div className="bg-indigo-100 p-3 rounded-lg w-fit mb-4">
              <Layers size={24} className="text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Automated Categorization</h3>
            <p className="text-gray-600">
              Expenses are intelligently sorted into categories, giving you a clear picture of your spending habits.
            </p>
          </div>
          
          {/* Feature 3 */}
          <div className="bg-gray-50 p-8 rounded-xl">
            <div className="bg-indigo-100 p-3 rounded-lg w-fit mb-4">
              <BarChart2 size={24} className="text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Interactive Insights</h3>
            <p className="text-gray-600">
              Visualize your finances with beautiful charts and receive personalized budgeting recommendations.
            </p>
          </div>
          
          {/* Feature 4 */}
          <div className="bg-gray-50 p-8 rounded-xl">
            <div className="bg-indigo-100 p-3 rounded-lg w-fit mb-4">
              <CreditCard size={24} className="text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Real-time Alerts</h3>
            <p className="text-gray-600">
              Get notified when you're approaching budget limits or when unusual spending patterns are detected.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 md:px-16 py-8 border-t border-gray-100 text-center">
        <p className="text-gray-500 text-sm">AssetArcAi — Smart expense management</p>
      </footer>
    </div>
  );
};

export default AssetArcAi;