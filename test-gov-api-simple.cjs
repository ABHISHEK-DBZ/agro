// Simple Government API Test
const https = require('https');

console.log('🌾 Testing Government API - Current Daily Price of Various Commodities from Various Markets (Mandi)');
console.log('⏰ Test Time:', new Date().toLocaleString());

const url = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=579b464db66ec23bdd0000015d8d13a03c6845da63e8d4bfe1ac5148&format=json&limit=10';

https.get(url, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      
      console.log('\n✅ API Response Status:', res.statusCode);
      console.log('📊 Total Records Available:', jsonData.total);
      console.log('📦 Records in Response:', jsonData.count);
      console.log('🔄 Response Status:', jsonData.status);
      
      if (jsonData.records && jsonData.records.length > 0) {
        console.log('\n🌾 Sample Market Data:');
        jsonData.records.forEach((record, index) => {
          console.log(`\n${index + 1}. ${record.commodity} (${record.variety})`);
          console.log(`   📍 Market: ${record.market}, ${record.district}, ${record.state}`);
          console.log(`   💰 Price: ₹${record.min_price} - ₹${record.max_price} (Modal: ₹${record.modal_price})`);
          console.log(`   📅 Date: ${record.arrival_date}`);
          console.log(`   🏷️  Grade: ${record.grade}`);
        });
        
        console.log('\n🎯 Government API Integration: SUCCESS! ✅');
        console.log('🚀 Ready for Smart Krishi Sahayak integration');
      }
    } catch (error) {
      console.error('❌ JSON Parse Error:', error.message);
      console.log('📄 Raw Response:', data.substring(0, 500));
    }
  });
}).on('error', (err) => {
  console.error('❌ API Request Error:', err.message);
});