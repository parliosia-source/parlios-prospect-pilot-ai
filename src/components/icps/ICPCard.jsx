import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Pencil, Trash2 } from 'lucide-react';

const SIZE_LABELS = {
  smb: 'PME', mid_market: 'Mid-Market', enterprise: 'Enterprise', all: 'Tous'
};

export default function ICPCard({ icp, isEditable, onEdit, onToggle, onDelete }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-sm truncate">{icp.name}</h3>
          {icp.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{icp.description}</p>
          )}
        </div>
        {isEditable && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => onEdit(icp)}>
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="icon" variant="ghost" className="w-7 h-7 text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer cet ICP ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. L'ICP "{icp.name}" sera supprimé définitivement.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(icp)} className="bg-destructive hover:bg-destructive/90">
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {icp.target_industries?.slice(0, 3).map(ind => (
          <Badge key={ind} variant="secondary" className="text-xs">{ind}</Badge>
        ))}
        {(icp.target_industries?.length || 0) > 3 && (
          <Badge variant="secondary" className="text-xs">+{icp.target_industries.length - 3}</Badge>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <Badge variant="outline" className="text-xs font-medium">
          {SIZE_LABELS[icp.target_company_size] || icp.target_company_size}
        </Badge>
        {isEditable ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{icp.is_active ? 'Actif' : 'Inactif'}</span>
            <Switch checked={icp.is_active} onCheckedChange={() => onToggle(icp)} />
          </div>
        ) : (
          <Badge className={icp.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}>
            {icp.is_active ? 'Actif' : 'Inactif'}
          </Badge>
        )}
      </div>
    </div>
  );
}