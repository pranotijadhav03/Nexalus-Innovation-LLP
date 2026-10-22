// Polyfill browser globals for node testing
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (key: string) => store.get(key) || null,
    setItem: (key: string, value: string) => { store.set(key, value); },
    removeItem: (key: string) => { store.delete(key); },
    clear: () => { store.clear(); },
    key: (index: number) => Array.from(store.keys())[index] || null,
    get length() { return store.size; }
  };
}
if (typeof (globalThis as any).window === 'undefined') {
  (globalThis as any).window = {
    dispatchEvent: () => true
  };
}
if (typeof (globalThis as any).CustomEvent === 'undefined') {
  (globalThis as any).CustomEvent = class {
    constructor(public type: string, public detail?: any) {}
  };
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ ${message}`);
}

async function runTests() {
  console.log('--- STARTING PHASE 2 BROADBAND DATA MODEL VERIFICATION ---\n');

  const {
    validateBroadbandPlan,
    validateBroadbandProvider
  } = await import('../src/types');

  const {
    initialBroadbandProviders,
    initialBroadbandPlans,
    initialInternetPlans
  } = await import('../src/data/initialData');

  const {
    getBroadbandProviders,
    getBroadbandProviderById,
    getBroadbandPlans,
    getPublishedBroadbandPlans,
    getBroadbandPlansByProvider,
    getBroadbandPlanById,
    createBroadbandPlan,
    updateBroadbandPlan,
    setBroadbandPlanPublished,
    updateBroadbandPlanDisplayOrder,
    updateBroadbandPlansOrder,
    deleteBroadbandPlan,
    formatBroadbandPrice,
    getInternetPlans
  } = await import('../src/firebase/services');

  // Test 1: Check initial provider documents
  console.log('Test 1: Verify Initial Provider Metadata');
  assert(initialBroadbandProviders.length === 3, 'Initial providers has 3 providers');
  const providerIds = initialBroadbandProviders.map(p => p.id);
  assert(providerIds.includes('airtel'), 'Includes Airtel');
  assert(providerIds.includes('bsnl'), 'Includes BSNL');
  assert(providerIds.includes('railwire'), 'Includes RailWire');

  // Test 2: Check initial plans are empty (no fake packages)
  console.log('\nTest 2: Verify Initial Plan Metadata has no fabricated packages');
  assert(initialBroadbandPlans.length === 0, 'initialBroadbandPlans is empty array');

  // Test 3: Provider Validation
  console.log('\nTest 3: Provider Validation');
  const validProviderCheck = validateBroadbandProvider({
    id: 'airtel',
    name: 'Airtel',
    displayOrder: 1
  });
  assert(validProviderCheck.isValid, 'Valid provider passes validation');

  const invalidProviderCheck = validateBroadbandProvider({
    id: '',
    name: ''
  });
  assert(!invalidProviderCheck.isValid, 'Empty provider fails validation');
  assert(invalidProviderCheck.errors.some(e => e.field === 'id'), 'Error on missing id');
  assert(invalidProviderCheck.errors.some(e => e.field === 'name'), 'Error on missing name');

  // Test 4: Plan Validation (Price must be numeric, currency explicit)
  console.log('\nTest 4: Plan Validation (Numeric Price & Explicit Currency)');
  const validPlanCheck = validateBroadbandPlan({
    providerId: 'airtel',
    name: 'Airtel Fiber Basic',
    speed: '40 Mbps',
    price: 499,
    currency: 'INR',
    displayOrder: 1
  });
  assert(validPlanCheck.isValid, 'Valid plan passes validation');

  const invalidPricePlan = validateBroadbandPlan({
    providerId: 'airtel',
    name: 'Airtel Fiber Basic',
    speed: '40 Mbps',
    price: -100, // Negative price invalid
    currency: 'INR'
  });
  assert(!invalidPricePlan.isValid, 'Negative price fails validation');
  assert(invalidPricePlan.errors.some(e => e.field === 'price'), 'Price field identified in error');

  const stringPricePlan = validateBroadbandPlan({
    providerId: 'airtel',
    name: 'Airtel Fiber Basic',
    speed: '40 Mbps',
    price: '499' as any, // String price invalid
    currency: 'INR'
  });
  assert(!stringPricePlan.isValid, 'String price fails validation');

  const missingCurrencyPlan = validateBroadbandPlan({
    providerId: 'airtel',
    name: 'Airtel Fiber Basic',
    speed: '40 Mbps',
    price: 499,
    currency: ''
  });
  assert(!missingCurrencyPlan.isValid, 'Empty currency fails validation');

  // Test 5: Price Formatter Utility
  console.log('\nTest 5: Price Formatter Utility');
  const formattedINR = formatBroadbandPrice(499, 'INR');
  assert(formattedINR.includes('499'), `Price formats correctly in INR: ${formattedINR}`);

  // Test 6: Provider Service Methods
  console.log('\nTest 6: Provider Service Methods');
  const providers = await getBroadbandProviders();
  assert(providers.length >= 3, `Retrieved ${providers.length} providers`);
  assert(providers[0].displayOrder <= providers[1].displayOrder, 'Providers ordered by displayOrder');

  const airtelProvider = await getBroadbandProviderById('airtel');
  assert(airtelProvider !== null && airtelProvider.name === 'Airtel', 'Retrieved Airtel provider by id');

  // Cleanup any leftover test plans first
  const existingPlans = await getBroadbandPlans();
  for (const p of existingPlans) {
    if (p.id.startsWith('test-plan-')) {
      await deleteBroadbandPlan(p.id);
    }
  }

  // Test 7: Plan Creation, Listing, and Retrieval
  console.log('\nTest 7: Plan Creation, Listing, and Retrieval');
  const testAirtelId = 'test-plan-airtel-40';
  const createdAirtelPlan = await createBroadbandPlan({
    id: testAirtelId,
    providerId: 'airtel',
    name: 'Airtel Fiber Basic 40 Mbps',
    speed: '40 Mbps',
    speedNumeric: 40,
    price: 499,
    currency: 'INR',
    originalPrice: 599,
    billingPeriod: 'monthly',
    validityDays: 30,
    dataAllowance: 'Unlimited (3300 GB FUP)',
    description: 'High-speed broadband for home browsing and streaming',
    features: ['40 Mbps Symmetrical Speed', 'Unlimited Local/STD Calls', 'Airtel Thanks Benefits'],
    availability: 'active',
    published: true,
    displayOrder: 1,
    city: 'Chiplun'
  });
  assert(createdAirtelPlan.id === testAirtelId, `Created plan with stable identifier: ${createdAirtelPlan.id}`);
  assert(createdAirtelPlan.price === 499, 'Numeric price is stored properly');
  assert(createdAirtelPlan.currency === 'INR', 'Currency stored properly');

  const testBsnlId = 'test-plan-bsnl-60';
  const createdBsnlPlan = await createBroadbandPlan({
    id: testBsnlId,
    providerId: 'bsnl',
    name: 'BSNL Bharat Fiber Rural 60 Mbps',
    speed: '60 Mbps',
    speedNumeric: 60,
    price: 599,
    currency: 'INR',
    billingPeriod: 'monthly',
    dataAllowance: 'Truly Unlimited',
    features: ['60 Mbps Fiber Speed', 'Free Voice Calling'],
    availability: 'active',
    published: false, // Draft plan
    displayOrder: 2
  });
  assert(createdBsnlPlan.id === testBsnlId, 'Created BSNL plan');

  // Test 8: Filter plans by provider and published status
  console.log('\nTest 8: Filter Plans by Provider & Published Status');
  const allPlans = await getBroadbandPlans();
  const testPlansOnly = allPlans.filter(p => p.id === testAirtelId || p.id === testBsnlId);
  assert(testPlansOnly.length === 2, `Total test plans in store: ${testPlansOnly.length}`);

  const publishedPlans = await getPublishedBroadbandPlans();
  assert(publishedPlans.some(p => p.id === testAirtelId), 'Published plans includes Airtel test plan');
  assert(!publishedPlans.some(p => p.id === testBsnlId), 'Published plans excludes draft BSNL test plan');

  const airtelPlans = await getBroadbandPlansByProvider('airtel');
  assert(airtelPlans.some(p => p.id === testAirtelId), 'getBroadbandPlansByProvider includes Airtel plan');

  const bsnlPublished = await getBroadbandPlansByProvider('bsnl', true);
  assert(!bsnlPublished.some(p => p.id === testBsnlId), 'Unpublished BSNL plan excluded when publishedOnly=true');

  const bsnlAll = await getBroadbandPlansByProvider('bsnl', false);
  assert(bsnlAll.some(p => p.id === testBsnlId), 'BSNL plan included when publishedOnly=false');

  // Test 9: Publishing and Unpublishing
  console.log('\nTest 9: Publishing and Unpublishing Plans');
  const publishedBsnl = await setBroadbandPlanPublished(createdBsnlPlan.id, true);
  assert(publishedBsnl?.published === true, 'Successfully published BSNL plan');

  const publishedNow = await getPublishedBroadbandPlans('bsnl');
  assert(publishedNow.some(p => p.id === testBsnlId), 'BSNL plan is now in published list');

  const unpublishedAirtel = await setBroadbandPlanPublished(createdAirtelPlan.id, false);
  assert(unpublishedAirtel?.published === false, 'Successfully unpublished Airtel plan');

  // Test 10: Updating Plan Details & Display Order
  console.log('\nTest 10: Updating Plan Details & Display Order');
  const updatedPlan = await updateBroadbandPlan(createdAirtelPlan.id, {
    price: 549,
    name: 'Airtel Fiber Basic Plus'
  });
  assert(updatedPlan?.price === 549, 'Price successfully updated');
  assert(updatedPlan?.name === 'Airtel Fiber Basic Plus', 'Name successfully updated');

  const reorderedPlan = await updateBroadbandPlanDisplayOrder(createdAirtelPlan.id, 5);
  assert(reorderedPlan?.displayOrder === 5, 'Display order updated via dedicated method');

  // Test 11: Batch Reordering
  console.log('\nTest 11: Batch Reordering of Plans');
  const batchSuccess = await updateBroadbandPlansOrder([createdBsnlPlan.id, createdAirtelPlan.id]);
  assert(batchSuccess, 'updateBroadbandPlansOrder returned true');
  const plan1 = await getBroadbandPlanById(createdBsnlPlan.id);
  const plan2 = await getBroadbandPlanById(createdAirtelPlan.id);
  assert(plan1?.displayOrder === 1, 'BSNL plan order set to 1');
  assert(plan2?.displayOrder === 2, 'Airtel plan order set to 2');

  // Test 12: Clean up Deletion
  console.log('\nTest 12: Clean up and Plan Deletion');
  const deleted1 = await deleteBroadbandPlan(createdAirtelPlan.id);
  const deleted2 = await deleteBroadbandPlan(createdBsnlPlan.id);
  assert(deleted1 && deleted2, 'Test plans successfully deleted');
  const afterDelete1 = await getBroadbandPlanById(createdAirtelPlan.id);
  const afterDelete2 = await getBroadbandPlanById(createdBsnlPlan.id);
  assert(afterDelete1 === null && afterDelete2 === null, 'Deleted plans no longer retrievable');

  // Test 13: Legacy One Broadband Plans Regression Check
  console.log('\nTest 13: Regression Check for Legacy One Broadband Plans');
  const legacyPlans = await getInternetPlans();
  assert(legacyPlans.length >= initialInternetPlans.length, `Legacy plans intact: ${legacyPlans.length} plans (>= ${initialInternetPlans.length})`);
  assert(legacyPlans.every(p => p.brandId === 'one-broadband'), 'All legacy plans belong to one-broadband');

  console.log('\n=========================================');
  console.log('🎉 ALL 13 TEST SUITES PASSED CLEANLY! 🎉');
  console.log('=========================================');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
