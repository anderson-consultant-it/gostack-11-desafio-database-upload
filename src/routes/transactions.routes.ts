import { Request, Response, Router } from 'express';
import { getCustomRepository } from 'typeorm';

import multer from 'multer';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import uploadConfig from '../config/upload';

const upload = multer(uploadConfig);

const transactionsRouter = Router();

transactionsRouter.get('/', async (req: Request, res: Response) => {
  const transactionRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionRepository.find();
  const balance = await transactionRepository.getBalance();

  return res.json({ transactions, balance });
});

transactionsRouter.post('/', async (req: Request, res: Response) => {
  const { title, value, type, category } = req.body;

  const createTransactionService = new CreateTransactionService();

  const transaction = await createTransactionService.execute({
    title,
    value,
    type,
    category,
  });

  return res.json(transaction);
});

transactionsRouter.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  const deleteTransactionService = new DeleteTransactionService();
  deleteTransactionService.execute(id);

  return res.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (req: Request, res: Response) => {
    const importTransactionsService = new ImportTransactionsService();

    const transactions = await importTransactionsService.execute(req.file.path);

    return res.json(transactions);
  },
);

export default transactionsRouter;
