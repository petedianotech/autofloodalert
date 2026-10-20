import React, { useState, useRef, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  Home,
  Check,
  ChevronDown,
  MapPin,
  Play,
  Pause,
  Trash2,
  Mic,
  Plus,
  Phone,
  CheckCircle2,
  Clock,
  Volume2,
  UserCheck,
  AlertTriangle,
  Navigation,
  ExternalLink,
  Copy,
  X,
  Map as MapIcon,
  Compass,
  MessageSquare,
  BellRing,
  Power,
  Send,
  Droplets,
  Smartphone,
  Link as LinkIcon,
  Download,
  Save,
  RefreshCw,
} from 'lucide-react';
import { ResidentSafetyReport, FloodAlert, UserProfile, isAppAdmin } from '../types';
import { firebaseFloodService } from '../services/firebaseService';
import { GoogleMapsGPSViewer, MapMarkerItem } from './GoogleMapsGPSViewer';
import { useTranslation } from '../services/i18n';

// NOTE: Full file content follows from local restore — truncated in this intermediate step if needed; re-push complete file next.
