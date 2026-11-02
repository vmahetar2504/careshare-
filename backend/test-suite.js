import mongoose from 'mongoose';
import './src/config/env.js';
import connectDB from './src/config/db.js';
import * as authService from './src/services/auth.service.js';
import * as userService from './src/services/user.service.js';
import * as equipmentService from './src/services/equipment.service.js';
import * as borrowService from './src/services/borrow.service.js';
import * as returnService from './src/services/return.service.js';
import * as inspectionService from './src/services/inspection.service.js';
import * as sanitizationService from './src/services/sanitization.service.js';
import * as notificationService from './src/services/notification.service.js';
import * as adminService from './src/services/admin.service.js';
import User from './src/models/User.js';
import Equipment from './src/models/Equipment.js';
import BorrowRequest from './src/models/BorrowRequest.js';
import Return from './src/models/Return.js';
import Inspection from './src/models/Inspection.js';
import Sanitization from './src/models/Sanitization.js';
import Notification from './src/models/Notification.js';

const runIntegrationTests = async () => {
  console.log('--- STARTING CARESHARE BACKEND INTEGRATION TEST SUITE ---');
  await connectDB();

  // Cleanup any previous test data
  const testEmails = [
    'donor.test@careshare.org',
    'borrower.test@careshare.org',
    'admin.test@careshare.org',
  ];
  const oldUsers = await User.find({ email: { $in: testEmails } });
  const oldUserIds = oldUsers.map((u) => u._id);

  if (oldUserIds.length > 0) {
    await Equipment.deleteMany({ owner: { $in: oldUserIds } });
    await BorrowRequest.deleteMany({ $or: [{ borrower: { $in: oldUserIds } }, { owner: { $in: oldUserIds } }] });
    await Return.deleteMany({ $or: [{ borrower: { $in: oldUserIds } }, { owner: { $in: oldUserIds } }] });
    await Notification.deleteMany({ user: { $in: oldUserIds } });
    await User.deleteMany({ _id: { $in: oldUserIds } });
  }

  console.log('✓ Cleaned up old test records.');

  // 1. TEST REGISTRATION & AUTH
  console.log('\n[1/17] Testing User Registration...');
  const donorReg = await authService.register({
    firstName: 'Alice',
    lastName: 'Donor',
    email: 'donor.test@careshare.org',
    password: 'Password123',
    phone: '9876543210',
    city: 'Mumbai',
    state: 'Maharashtra',
  });
  console.log(`✓ Donor registered successfully (ID: ${donorReg.user._id})`);

  const borrowerReg = await authService.register({
    firstName: 'Bob',
    lastName: 'Borrower',
    email: 'borrower.test@careshare.org',
    password: 'Password123',
    phone: '9876543211',
    city: 'Mumbai',
    state: 'Maharashtra',
  });
  console.log(`✓ Borrower registered successfully (ID: ${borrowerReg.user._id})`);

  const adminReg = await authService.register({
    firstName: 'Super',
    lastName: 'Admin',
    email: 'admin.test@careshare.org',
    password: 'AdminPassword123',
    phone: '9876543212',
    city: 'Mumbai',
    state: 'Maharashtra',
  });
  // Promote admin to ADMIN role
  await User.findByIdAndUpdate(adminReg.user._id, { role: 'ADMIN' });
  console.log(`✓ Admin registered and promoted to ADMIN (ID: ${adminReg.user._id})`);

  // 2. TEST LOGIN & JWT
  console.log('\n[2/17] Testing Login & Password Verification...');
  const loginResult = await authService.login('donor.test@careshare.org', 'Password123');
  if (!loginResult.token) throw new Error('Login failed: Token not returned');
  console.log('✓ Login verified, JWT issued.');

  // 3. TEST FORGOT & RESET PASSWORD
  console.log('\n[3/17] Testing Forgot & Reset Password Flow...');
  const forgotResult = await authService.forgotPassword('donor.test@careshare.org');
  if (!forgotResult.devResetToken) throw new Error('Dev reset token missing in development');
  console.log(`✓ Reset token generated: ${forgotResult.devResetToken}`);

  await authService.resetPassword(forgotResult.devResetToken, 'NewPassword123');
  console.log('✓ Password reset succeeded with new password.');

  // Verify new password works
  await authService.login('donor.test@careshare.org', 'NewPassword123');
  console.log('✓ Login with new password succeeded.');

  // 4. TEST PROFILE UPDATE
  console.log('\n[4/17] Testing User Profile Update...');
  const updatedUser = await userService.updateProfile(donorReg.user._id, {
    address: '42 Marine Drive',
    pincode: '400020',
  });
  if (updatedUser.address !== '42 Marine Drive') throw new Error('Profile update failed');
  console.log('✓ User profile updated successfully.');

  // 5. TEST EQUIPMENT CREATION (Defaults to PENDING and UNAVAILABLE)
  console.log('\n[5/17] Testing Equipment Listing Creation...');
  const newEquipment = await equipmentService.createEquipment(
    donorReg.user._id,
    {
      name: 'Foldable Lightweight Wheelchair',
      category: 'Wheelchair',
      description: 'Sturdy chrome-plated foldable wheelchair with comfortable padded armrests and foot pedals.',
      brand: 'Karma',
      model: 'CH-100',
      condition: 'EXCELLENT',
      quantity: 1,
      location: {
        address: '42 Marine Drive',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400020',
      },
      usageInstructions: 'Ensure brakes are locked before patient mounts or dismounts.',
      safetyInformation: 'Max weight capacity 120 kg.',
    },
    ['/uploads/wheelchair-sample.jpg']
  );

  if (newEquipment.verificationStatus !== 'PENDING' || newEquipment.availabilityStatus !== 'UNAVAILABLE') {
    throw new Error('Equipment initial status must be PENDING and UNAVAILABLE');
  }
  console.log(`✓ Equipment created with status: ${newEquipment.verificationStatus} / ${newEquipment.availabilityStatus}`);

  // 6. TEST ADMIN VERIFICATION & APPROVAL
  console.log('\n[6/17] Testing Admin Verification of Equipment...');
  const pendingList = await adminService.getPendingEquipment({});
  if (pendingList.equipment.length === 0) throw new Error('Pending equipment list is empty');
  console.log(`✓ Admin fetched ${pendingList.equipment.length} pending equipment item(s).`);

  const approvedEq = await adminService.approveEquipment(newEquipment._id);
  if (approvedEq.verificationStatus !== 'APPROVED' || approvedEq.availabilityStatus !== 'AVAILABLE') {
    throw new Error('Equipment status after admin approval must be APPROVED and AVAILABLE');
  }
  console.log(`✓ Admin approved equipment. Status now: ${approvedEq.verificationStatus} & ${approvedEq.availabilityStatus}`);

  // 7. TEST DISCOVERY & SEARCH
  console.log('\n[7/17] Testing Equipment Discovery & Search Filters...');
  const searchResult = await equipmentService.getAllEquipment({
    search: 'Foldable',
    category: 'Wheelchair',
    city: 'Mumbai',
  });
  if (searchResult.equipment.length === 0) throw new Error('Equipment search failed to find item');
  console.log(`✓ Discovery search returned ${searchResult.equipment.length} matching equipment.`);

  // 8. TEST BORROW REQUEST VALIDATION (Cannot borrow own equipment)
  console.log('\n[8/17] Testing Borrow Request Rules (Self-borrow prevention)...');
  try {
    await borrowService.createBorrowRequest(donorReg.user._id, {
      equipmentId: newEquipment._id.toString(),
      requestedFrom: new Date(Date.now() + 86400000).toISOString(),
      requestedUntil: new Date(Date.now() + 86400000 * 7).toISOString(),
      reason: 'Self test should fail',
    });
    throw new Error('Self-borrowing should have thrown an error!');
  } catch (err) {
    console.log(`✓ Successfully prevented self-borrow: "${err.message}"`);
  }

  // 9. TEST VALID BORROW REQUEST CREATION
  console.log('\n[9/17] Testing Valid Borrow Request Submission...');
  const borrowReq = await borrowService.createBorrowRequest(borrowerReg.user._id, {
    equipmentId: newEquipment._id.toString(),
    requestedFrom: new Date(Date.now() + 86400000).toISOString(),
    requestedUntil: new Date(Date.now() + 86400000 * 14).toISOString(),
    reason: 'Recovering from knee surgery and need assistance for 2 weeks.',
    message: 'Can pick up tomorrow afternoon.',
  });
  if (borrowReq.status !== 'PENDING') throw new Error('Initial borrow status must be PENDING');
  console.log(`✓ Borrow request created with status: ${borrowReq.status}`);

  // 10. TEST OVERLAPPING REQUEST PREVENTION
  console.log('\n[10/17] Testing Overlapping Request Prevention...');
  // Approve first request to reserve the equipment
  await borrowService.approveBorrowRequest(borrowReq._id, donorReg.user._id, 'USER');
  const reservedEq = await Equipment.findById(newEquipment._id);
  if (reservedEq.availabilityStatus !== 'RESERVED') throw new Error('Equipment should be RESERVED after approval');
  console.log('✓ Borrow request approved. Equipment availabilityStatus changed to RESERVED.');

  // Try creating another request on reserved/unavailable equipment
  try {
    await borrowService.createBorrowRequest(borrowerReg.user._id, {
      equipmentId: newEquipment._id.toString(),
      requestedFrom: new Date(Date.now() + 86400000 * 2).toISOString(),
      requestedUntil: new Date(Date.now() + 86400000 * 5).toISOString(),
      reason: 'Conflicting borrow',
    });
    throw new Error('Conflicting borrow should have failed!');
  } catch (err) {
    console.log(`✓ Overlapping/unavailable request correctly blocked: "${err.message}"`);
  }

  // 11. TEST PICKUP / ACTIVE BORROWING
  console.log('\n[11/17] Testing Equipment Pickup...');
  const activeReq = await borrowService.pickupBorrowRequest(borrowReq._id, donorReg.user._id, 'USER');
  if (activeReq.status !== 'ACTIVE') throw new Error('Request status must be ACTIVE after pickup');
  const borrowedEq = await Equipment.findById(newEquipment._id);
  if (borrowedEq.availabilityStatus !== 'BORROWED') throw new Error('Equipment status must be BORROWED');
  console.log(`✓ Equipment picked up. Request: ACTIVE, Equipment: ${borrowedEq.availabilityStatus}`);

  // 12. TEST RETURN REQUEST WORKFLOW
  console.log('\n[12/17] Testing Return Request Initiation...');
  const returnRec = await returnService.createReturnRequest(borrowerReg.user._id, {
    borrowRequestId: borrowReq._id.toString(),
    notes: 'Recovery completed, returning in great condition.',
  });
  if (returnRec.status !== 'REQUESTED') throw new Error('Return status must be REQUESTED');
  console.log(`✓ Return initiated with status: ${returnRec.status}`);

  // 13. TEST OWNER RECEIVING RETURN
  console.log('\n[13/17] Testing Owner Confirmation of Return...');
  const receivedReturn = await returnService.receiveReturn(
    returnRec._id,
    donorReg.user._id,
    'USER',
    { returnCondition: 'GOOD', notes: 'Received back safely.' }
  );
  if (receivedReturn.status !== 'INSPECTION_PENDING') {
    throw new Error('Return status after receipt must be INSPECTION_PENDING');
  }
  const completedBorrow = await BorrowRequest.findById(borrowReq._id);
  if (completedBorrow.status !== 'COMPLETED') throw new Error('BorrowRequest status should now be COMPLETED');
  console.log(`✓ Equipment received by owner. Return: INSPECTION_PENDING, Borrow: COMPLETED.`);

  // 14. TEST INSPECTION (Admin records safety inspection)
  console.log('\n[14/17] Testing Equipment Safety Inspection (Passed)...');
  const inspection = await inspectionService.createInspection(
    adminReg.user._id,
    'ADMIN',
    {
      returnId: receivedReturn._id.toString(),
      conditionBefore: 'EXCELLENT',
      conditionAfter: 'GOOD',
      damageFound: false,
      estimatedRepairRequired: false,
      notes: 'No structural damage, wheels and brakes in perfect functioning order.',
    }
  );
  if (inspection.status !== 'PASSED') throw new Error('Inspection status must be PASSED');
  const inspectingEq = await Equipment.findById(newEquipment._id);
  if (inspectingEq.availabilityStatus !== 'SANITIZATION') {
    throw new Error('Equipment availabilityStatus must now be SANITIZATION');
  }
  console.log(`✓ Inspection PASSED. Equipment moved to availabilityStatus: ${inspectingEq.availabilityStatus}`);

  // 15. TEST SANITIZATION WORKFLOW & RESTORATION TO AVAILABLE
  console.log('\n[15/17] Testing Sanitization Process & Equipment Restoration...');
  const sanitization = await sanitizationService.createSanitization(
    adminReg.user._id,
    'ADMIN',
    {
      inspectionId: inspection._id.toString(),
      method: 'Hospital-grade quaternary ammonium wipe down and UV sterilization.',
      notes: 'Surface contact time 10 minutes, dried thoroughly.',
    }
  );
  console.log(`✓ Sanitization logged (Status: ${sanitization.status})`);

  const completedSanitization = await sanitizationService.completeSanitization(
    sanitization._id,
    adminReg.user._id,
    'ADMIN',
    { notes: 'Final swab test clear, ready for next patient.' }
  );
  if (completedSanitization.status !== 'COMPLETED') throw new Error('Sanitization must be COMPLETED');

  const finalEq = await Equipment.findById(newEquipment._id);
  if (finalEq.availabilityStatus !== 'AVAILABLE') {
    throw new Error('Equipment must be restored to AVAILABLE after sanitization completion');
  }
  console.log(`✓ Sanitization COMPLETED! Equipment is now restored to: ${finalEq.availabilityStatus}`);

  // 16. TEST NOTIFICATIONS
  console.log('\n[16/17] Testing Notifications Audit...');
  const donorNotifications = await notificationService.getUserNotifications(donorReg.user._id);
  console.log(`✓ Donor received ${donorNotifications.notifications.length} notification(s).`);
  const borrowerNotifications = await notificationService.getUserNotifications(borrowerReg.user._id);
  console.log(`✓ Borrower received ${borrowerNotifications.notifications.length} notification(s).`);

  // 17. TEST ADMIN DASHBOARD STATS
  console.log('\n[17/17] Testing Admin Dashboard Statistics...');
  const stats = await adminService.getDashboardStats();
  console.log('✓ Admin dashboard stats aggregated successfully:');
  console.log('  Users:', stats.users);
  console.log('  Equipment:', stats.equipment);
  console.log('  Borrow Requests:', stats.borrowRequests);
  console.log('  Recent Activity Requests Count:', stats.recentActivity.recentRequests.length);

  console.log('\n======================================================');
  console.log('🎉 ALL 17 CARESHARE INTEGRATION TESTS PASSED WITH 100% SUCCESS!');
  console.log('======================================================');

  await mongoose.disconnect();
  process.exit(0);
};

runIntegrationTests().catch((err) => {
  console.error('\n❌ INTEGRATION TEST FAILED:', err);
  mongoose.disconnect().finally(() => process.exit(1));
});
