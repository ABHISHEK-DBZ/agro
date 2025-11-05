// Test Government API for Market Prices
const axios = require('axios');

async function testGovernmentMarketAPI() {
  try {
    console.log('🏛️ Testing Government of India Market Prices API...');
    
    const response = await axios.get('https://api.data.gov.in/resource/579b464db66ec23bdd0000015d8d13a03c6845da63e8d4bfe1ac5148', {
      params: {
        'api-key': '579b464db66ec23bdd0000015d8d13a03c6845da63e8d4bfe1ac5148',
        format: 'json',
        limit: 10, // Small limit for testing
        offset: 0
      },
      timeout: 15000
    });

    console.log('✅ Government API Response Status:', response.status);
    console.log('📊 Total Records Available:', response.data.total);
    console.log('📄 Records in Response:', response.data.records?.length || 0);
    
    if (response.data.records && response.data.records.length > 0) {
      console.log('\n🔍 Sample Market Data:');
      const sample = response.data.records[0];
      console.log('Commodity:', sample.commodity || sample.commodity_name || 'N/A');
      console.log('Market:', sample.market || sample.market_name || 'N/A');
      console.log('State:', sample.state || sample.state_name || 'N/A');
      console.log('Modal Price:', sample.modal_price || sample.price || 'N/A');
      console.log('Min Price:', sample.min_price || 'N/A');
      console.log('Max Price:', sample.max_price || 'N/A');
      console.log('Arrivals:', sample.arrivals || sample.quantity || 'N/A');
      console.log('Date:', sample.arrival_date || sample.date || 'N/A');
      
      console.log('\n📋 Available Fields in Response:');
      console.log(Object.keys(sample));
    }
    
    return true;
  } catch (error) {
    console.error('❌ Government API Test Failed:');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    return false;
  }
}

testGovernmentMarketAPI();