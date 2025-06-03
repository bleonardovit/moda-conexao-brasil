
import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Star, EyeOff, Ban, Search, Filter } from 'lucide-react';
import { getAllReviewsForModeration, hideReview, banUserFromReviews } from '@/services/reviewService';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Review } from '@/types/review';

interface ReviewWithSupplier extends Review {
  supplier_name?: string;
}

const ReviewsModeration = () => {
  const [reviews, setReviews] = useState<ReviewWithSupplier[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<ReviewWithSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [supplierFilter, setSupplierFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedReview, setSelectedReview] = useState<ReviewWithSupplier | null>(null);
  const [showHideDialog, setShowHideDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [banReason, setBanReason] = useState('');
  const { toast } = useToast();

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await getAllReviewsForModeration();
      setReviews(data);
      setFilteredReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as avaliações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    let filtered = reviews;

    if (supplierFilter) {
      filtered = filtered.filter(review => 
        review.supplier_name?.toLowerCase().includes(supplierFilter.toLowerCase())
      );
    }

    if (userFilter) {
      filtered = filtered.filter(review => 
        review.user_name.toLowerCase().includes(userFilter.toLowerCase())
      );
    }

    if (ratingFilter !== 'all') {
      filtered = filtered.filter(review => 
        review.rating === parseInt(ratingFilter)
      );
    }

    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(review => {
        const reviewDate = new Date(review.created_at);
        return reviewDate.toDateString() === filterDate.toDateString();
      });
    }

    setFilteredReviews(filtered);
  }, [reviews, supplierFilter, userFilter, ratingFilter, dateFilter]);

  const handleHideReview = async () => {
    if (!selectedReview) return;

    try {
      await hideReview(selectedReview.id);
      toast({
        title: "Sucesso",
        description: "Avaliação ocultada com sucesso.",
      });
      setShowHideDialog(false);
      setSelectedReview(null);
      fetchReviews();
    } catch (error) {
      console.error('Error hiding review:', error);
      toast({
        title: "Erro",
        description: "Não foi possível ocultar a avaliação.",
        variant: "destructive",
      });
    }
  };

  const handleBanUser = async () => {
    if (!selectedReview) return;

    try {
      await banUserFromReviews(selectedReview.user_id, banReason);
      toast({
        title: "Sucesso",
        description: "Usuário banido de fazer avaliações.",
      });
      setShowBanDialog(false);
      setSelectedReview(null);
      setBanReason('');
      fetchReviews();
    } catch (error: any) {
      console.error('Error banning user:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível banir o usuário.",
        variant: "destructive",
      });
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const clearFilters = () => {
    setSupplierFilter('');
    setUserFilter('');
    setRatingFilter('all');
    setDateFilter('');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Moderar Avaliações</h1>
          <Button onClick={fetchReviews} disabled={loading}>
            <Search className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier-filter">Fornecedor</Label>
                <Input
                  id="supplier-filter"
                  placeholder="Nome do fornecedor..."
                  value={supplierFilter}
                  onChange={(e) => setSupplierFilter(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-filter">Usuário</Label>
                <Input
                  id="user-filter"
                  placeholder="Nome do usuário..."
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating-filter">Nota</Label>
                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as notas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as notas</SelectItem>
                    <SelectItem value="1">1 estrela</SelectItem>
                    <SelectItem value="2">2 estrelas</SelectItem>
                    <SelectItem value="3">3 estrelas</SelectItem>
                    <SelectItem value="4">4 estrelas</SelectItem>
                    <SelectItem value="5">5 estrelas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-filter">Data</Label>
                <Input
                  id="date-filter"
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
            </div>
            <Button variant="outline" onClick={clearFilters}>
              Limpar Filtros
            </Button>
          </CardContent>
        </Card>

        {/* Tabela de Avaliações */}
        <Card>
          <CardHeader>
            <CardTitle>
              Avaliações ({filteredReviews.length} de {reviews.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Carregando avaliações...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Nota</TableHead>
                    <TableHead>Comentário</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell className="font-medium">
                        {review.supplier_name || 'N/A'}
                      </TableCell>
                      <TableCell>{review.user_name}</TableCell>
                      <TableCell>{renderStars(review.rating)}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {review.comment || '-'}
                      </TableCell>
                      <TableCell>
                        {format(new Date(review.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        {review.hidden ? (
                          <span className="text-red-600 font-medium">Oculta</span>
                        ) : (
                          <span className="text-green-600 font-medium">Visível</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {!review.hidden && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedReview(review);
                                setShowHideDialog(true);
                              }}
                            >
                              <EyeOff className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedReview(review);
                              setShowBanDialog(true);
                            }}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dialog para ocultar avaliação */}
        <Dialog open={showHideDialog} onOpenChange={setShowHideDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ocultar Avaliação</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja ocultar esta avaliação? Ela não será mais exibida para os usuários.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowHideDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleHideReview}>
                Ocultar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog para banir usuário */}
        <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Banir Usuário</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja banir este usuário de fazer novas avaliações?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="ban-reason">Motivo do banimento (opcional)</Label>
                <Textarea
                  id="ban-reason"
                  placeholder="Digite o motivo do banimento..."
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBanDialog(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleBanUser}>
                Banir Usuário
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default ReviewsModeration;
