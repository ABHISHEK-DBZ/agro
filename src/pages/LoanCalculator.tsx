import React, { useState } from 'react';
import { Calculator, IndianRupee, TrendingDown, Calendar, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { pageVariants, cardVariants } from '../utils/animations';

const LoanCalculator: React.FC = () => {
  const [loanAmount, setLoanAmount] = useState<number>(100000);
  const [interestRate, setInterestRate] = useState<number>(7);
  const [tenure, setTenure] = useState<number>(12);
  const [loanType, setLoanType] = useState<'kisan-credit' | 'crop' | 'equipment' | 'land'>('kisan-credit');

  // Calculate EMI
  const calculateEMI = () => {
    const monthlyRate = interestRate / 12 / 100;
    const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                (Math.pow(1 + monthlyRate, tenure) - 1);
    return emi;
  };

  const emi = calculateEMI();
  const totalAmount = emi * tenure;
  const totalInterest = totalAmount - loanAmount;

  const loanTypes = {
    'kisan-credit': { name: 'किसान क्रेडिट कार्ड', rate: '7%', limit: '₹3 लाख तक' },
    'crop': { name: 'फसल ऋण', rate: '7-9%', limit: '₹5 लाख तक' },
    'equipment': { name: 'कृषि उपकरण ऋण', rate: '9-11%', limit: '₹10 लाख तक' },
    'land': { name: 'भूमि खरीद ऋण', rate: '10-12%', limit: '₹50 लाख तक' }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Calculator className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">कृषि ऋण कैलकुलेटर</h1>
          </div>
          <p className="text-gray-600">अपने कृषि ऋण की EMI और कुल राशि की गणना करें</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calculator Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">ऋण विवरण दर्ज करें</h2>

            {/* Loan Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ऋण प्रकार
              </label>
              <select
                value={loanType}
                onChange={(e) => setLoanType(e.target.value as any)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(loanTypes).map(([key, type]) => (
                  <option key={key} value={key}>
                    {type.name} ({type.rate})
                  </option>
                ))}
              </select>
            </div>

            {/* Loan Amount */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ऋण राशि (₹)
              </label>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="range"
                min="10000"
                max="5000000"
                step="10000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full mt-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>₹10,000</span>
                <span>₹50,00,000</span>
              </div>
            </div>

            {/* Interest Rate */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ब्याज दर (% प्रति वर्ष)
              </label>
              <input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                step="0.1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="range"
                min="3"
                max="15"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full mt-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>3%</span>
                <span>15%</span>
              </div>
            </div>

            {/* Tenure */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                अवधि (महीने)
              </label>
              <input
                type="number"
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="range"
                min="6"
                max="240"
                step="6"
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                className="w-full mt-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>6 months</span>
                <span>20 years</span>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* EMI Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <IndianRupee className="w-6 h-6" />
                <h3 className="text-lg font-semibold">मासिक EMI</h3>
              </div>
              <div className="text-4xl font-bold mb-2">₹{emi.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
              <p className="text-blue-100">प्रति माह</p>
            </div>

            {/* Total Amount */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <TrendingDown className="w-5 h-5" />
                    <span className="text-sm">मूल राशि</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-800">
                    ₹{loanAmount.toLocaleString('en-IN')}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Calendar className="w-5 h-5" />
                    <span className="text-sm">कुल ब्याज</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    ₹{totalInterest.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">कुल भुगतान</span>
                  <span className="text-2xl font-bold text-green-600">
                    ₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Loan Info */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-amber-900 mb-2">
                    {loanTypes[loanType].name}
                  </h4>
                  <ul className="space-y-1 text-sm text-amber-800">
                    <li>• ब्याज दर: {loanTypes[loanType].rate}</li>
                    <li>• अधिकतम सीमा: {loanTypes[loanType].limit}</li>
                    <li>• सरकारी सब्सिडी उपलब्ध</li>
                    <li>• कम कागजी कार्रवाई</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Government Schemes */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-3">सरकारी योजनाएं</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-gray-600">किसान क्रेडिट कार्ड - 7% ब्याज</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-gray-600">PM-KISAN - ₹6000/वर्ष</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-gray-600">फसल बीमा योजना</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LoanCalculator;
