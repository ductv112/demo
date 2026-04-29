'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Copy, Link, Eye, Pencil, Link2Off, Lock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  createPublicLink,
  revokePublicLink,
  updatePublicLinkPermission,
  type PublicLink,
} from '@/lib/public-links-api';

interface CreatePublicLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceType: 'DOCUMENT' | 'FOLDER';
  resourceId: string;
  onRevoke?: () => void;
  isConfidential?: boolean; // Phase 62: block tao link cho tai lieu mat
}

/**
 * Dialog tạo/quản lý public link — giống Google Drive.
 * Khi open = true → TỰ ĐỘNG lấy/tạo link (idempotent) → hiển thị URL ngay.
 * DOCUMENT: RadioGroup đổi VIEWER↔EDITOR inline → gọi PATCH API → toast.
 * FOLDER: chỉ hiển thị "Chỉ xem" (không cho đổi).
 * URL KHÔNG thay đổi khi đổi quyền.
 */
export function CreatePublicLinkDialog({
  open,
  onOpenChange,
  resourceType,
  resourceId,
  onRevoke,
  isConfidential,
}: CreatePublicLinkDialogProps) {
  const t = useTranslations('documents');
  const [publicLink, setPublicLink] = useState<PublicLink | null>(null);
  const [loading, setLoading] = useState(false);
  const [publicUrl, setPublicUrl] = useState('');
  const [updatingPermission, setUpdatingPermission] = useState(false);
  const [revokeConfirmOpen, setRevokeConfirmOpen] = useState(false);
  const [revoking, setRevoking] = useState(false);

  // Khi dialog mở → TỰ ĐỘNG tạo/lấy link (idempotent)
  // Phase 62: không tạo link cho tài liệu mật
  useEffect(() => {
    if (open && resourceId && !isConfidential) {
      handleCreateOrGet();
    }
    if (!open) {
      setPublicLink(null);
      setPublicUrl('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isConfidential]);

  const handleCreateOrGet = async () => {
    setLoading(true);
    try {
      // Idempotent: luôn trả link cũ nếu đã có (với VIEWER mặc định)
      const link = await createPublicLink(resourceType, resourceId, 'VIEWER');
      setPublicLink(link);
      const url =
        typeof window !== 'undefined'
          ? `${window.location.origin}/public/${link.token}`
          : `/public/${link.token}`;
      setPublicUrl(url);
    } catch (error: any) {
      const msg =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Không thể tạo liên kết';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Đổi quyền (VIEWER↔EDITOR) — URL KHÔNG đổi
  const handlePermissionChange = async (newLevel: 'VIEWER' | 'EDITOR') => {
    if (!publicLink || newLevel === publicLink.permissionLevel) return;
    setUpdatingPermission(true);
    try {
      await updatePublicLinkPermission(publicLink.id, newLevel);
      setPublicLink({ ...publicLink, permissionLevel: newLevel });
      toast.success(
        newLevel === 'EDITOR' ? t('publicLink.enabledEditor') : t('publicLink.switchedViewer')
      );
    } catch (error: any) {
      const msg =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Không thể cập nhật quyền';
      toast.error(msg);
    } finally {
      setUpdatingPermission(false);
    }
  };

  // Copy link to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success(t('publicLink.copied'));
    } catch {
      toast.error('Không thể sao chép. Hãy sao chép thủ công.');
    }
  };

  // Thu hồi liên kết công khai
  const handleRevoke = async () => {
    if (!publicLink) return;
    setRevoking(true);
    try {
      await revokePublicLink(publicLink.id);
      toast.success(t('publicLink.revokeSuccess'));
      setRevokeConfirmOpen(false);
      onOpenChange(false);
      onRevoke?.();
    } catch (error: any) {
      const msg =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Không thể thu hồi liên kết';
      toast.error(msg);
    } finally {
      setRevoking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg overflow-hidden">
        {/* Colored header strip */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-400 rounded-t-lg" />

        <DialogHeader className="pt-2">
          <DialogTitle className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-cyan-100">
              <Link className="h-4 w-4 text-cyan-600" />
            </div>
            {t('publicLink.title')}
          </DialogTitle>
          <DialogDescription>
            {t('publicLink.description')}
          </DialogDescription>
        </DialogHeader>

        {/* Phase 62: canh bao tai lieu mat */}
        {isConfidential ? (
          <div className="flex items-center gap-2 rounded-md border border-rose-300 bg-rose-50 p-3 my-2">
            <Lock className="h-5 w-5 text-rose-500 shrink-0" />
            <p className="text-sm text-rose-700">Tài liệu mật không hỗ trợ chia sẻ liên kết công khai.</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            {t('publicLink.loadingLink')}
          </div>
        ) : publicLink ? (
          <div className="space-y-4 py-2">
            {/* URL + Copy */}
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={publicUrl}
                className="flex-1 text-sm font-mono"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                title={t('publicLink.copyLink')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            {/* Permission selector — chỉ DOCUMENT */}
            {resourceType === 'DOCUMENT' && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('publicLink.permissionLabel')}</Label>
                <RadioGroup
                  value={publicLink.permissionLevel}
                  onValueChange={(v) =>
                    handlePermissionChange(v as 'VIEWER' | 'EDITOR')
                  }
                  disabled={updatingPermission}
                  className="space-y-2"
                >
                  <div
                    className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${publicLink.permissionLevel === 'VIEWER' ? 'border-blue-300 bg-blue-50' : 'hover:bg-slate-50'}`}
                    onClick={() =>
                      !updatingPermission && handlePermissionChange('VIEWER')
                    }
                  >
                    <RadioGroupItem
                      value="VIEWER"
                      id="viewer"
                      className="mt-0.5"
                      disabled={updatingPermission}
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor="viewer"
                        className="flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <Eye className="h-4 w-4 text-blue-500" />
                        {t('publicLink.viewerLabel')}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t('publicLink.viewerDesc')}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${publicLink.permissionLevel === 'EDITOR' ? 'border-amber-300 bg-amber-50' : 'hover:bg-slate-50'}`}
                    onClick={() =>
                      !updatingPermission && handlePermissionChange('EDITOR')
                    }
                  >
                    <RadioGroupItem
                      value="EDITOR"
                      id="editor"
                      className="mt-0.5"
                      disabled={updatingPermission}
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor="editor"
                        className="flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <Pencil className="h-4 w-4 text-amber-500" />
                        {t('publicLink.editorLabel')}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t('publicLink.editorDesc')}
                      </p>
                    </div>
                  </div>
                </RadioGroup>
                {updatingPermission && (
                  <p className="text-xs text-muted-foreground">
                    {t('publicLink.updatingPermission')}
                  </p>
                )}
              </div>
            )}

            {/* FOLDER: chỉ xem */}
            {resourceType === 'FOLDER' && (
              <div className="flex items-center gap-2 rounded-lg border p-3 bg-muted/20">
                <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-sm text-muted-foreground">
                  {t('publicLink.folderViewOnly')}
                </p>
              </div>
            )}
          </div>
        ) : null}

        <DialogFooter className="mt-2 flex-row justify-between sm:justify-between">
          {/* Thu hồi liên kết — bên trái */}
          {publicLink && !loading && (
            <Button
              variant="destructive"
              onClick={() => setRevokeConfirmOpen(true)}
              disabled={revoking}
              className="flex items-center gap-2"
            >
              <Link2Off className="h-4 w-4" />
              {t('publicLink.revoke')}
            </Button>
          )}
          {/* Spacer khi không có nút revoke */}
          {(!publicLink || loading) && <div />}

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={handleCopy}
              disabled={!publicLink || loading || !!isConfidential}
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm"
            >
              <Copy className="h-4 w-4" />
              {t('publicLink.copyLink')}
            </Button>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              {t('publicLink.close')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      {/* AlertDialog xác nhận thu hồi */}
      <AlertDialog open={revokeConfirmOpen} onOpenChange={setRevokeConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('publicLink.revokeConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('publicLink.revokeConfirmMessage')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revoking}>
              {t('publicLink.revokeCancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleRevoke();
              }}
              disabled={revoking}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {revoking ? t('publicLink.revoking') : t('publicLink.revokeConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
