import { Router } from 'express';
import authRoutes            from './auth';
import vehicleRoutes         from './vehicles';
import bookingRoutes         from './bookings';
import paymentRoutes         from './payments';
import userRoutes            from './users';
import uploadRoutes          from './upload';
import reviewRoutes          from './reviews';
import messageRoutes         from './messages';
import documentRoutes        from './documents';
import notificationRoutes    from './notifications';
import earningRoutes         from './earnings';
import adminRoutes           from './admin';
import conditionReportRoutes from './conditionReports';
import availabilityRoutes    from './availability';
import aiRoutes              from './ai';
import checklistRoutes       from './checklists';
import lateFineRoutes        from './lateFines';

const router = Router();

router.use('/auth',              authRoutes);
router.use('/vehicles',          vehicleRoutes);
router.use('/bookings',          bookingRoutes);
router.use('/payments',          paymentRoutes);
router.use('/users',             userRoutes);
router.use('/upload',            uploadRoutes);
router.use('/reviews',           reviewRoutes);
router.use('/messages',          messageRoutes);
router.use('/documents',         documentRoutes);
router.use('/notifications',     notificationRoutes);
router.use('/earnings',          earningRoutes);
router.use('/admin',             adminRoutes);
router.use('/condition-reports', conditionReportRoutes);
router.use('/availability',      availabilityRoutes);
router.use('/ai',                aiRoutes);
router.use('/checklists',        checklistRoutes);
router.use('/late-fines',        lateFineRoutes);

router.get('/health', (_req, res) => res.json({ ok: true, ts: new Date() }));

export default router;