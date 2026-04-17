package com.finance.financetracker.service;

import com.finance.financetracker.dto.TransactionDTO;
import com.finance.financetracker.model.Transaction;

import java.time.LocalDate;
import java.util.List;

public interface TransactionService {

    Transaction addTransaction(TransactionDTO dto);

    List<Transaction> getAllTransactions();

    List<Transaction> getTransactionsByDate(LocalDate date);

    List<Transaction> getTransactionsByCategory(String category);

    void deleteTransaction(Long id);
}
