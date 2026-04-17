package com.finance.financetracker.service.impl;

import com.finance.financetracker.dto.TransactionDTO;
import com.finance.financetracker.model.Transaction;
import com.finance.financetracker.model.TransactionType;
import com.finance.financetracker.model.User;
import com.finance.financetracker.repository.TransactionRepository;
import com.finance.financetracker.repository.UserRepository;
import com.finance.financetracker.service.TransactionService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository repository;
    private final UserRepository userRepository;

    public TransactionServiceImpl(TransactionRepository repository,
                                  UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    // ✅ CREATE TRANSACTION (WITH USER + ENUM FIX)
    @Override
    public Transaction addTransaction(TransactionDTO dto) {

        Transaction transaction = new Transaction();

        // 🔥 ENUM conversion
        try {
            transaction.setType(TransactionType.valueOf(dto.getType().toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid transaction type");
        }

        transaction.setAmount(dto.getAmount());
        transaction.setCategory(dto.getCategory());
        transaction.setDescription(dto.getDescription());
        transaction.setDate(dto.getDate());

        // 🔥 GET LOGGED-IN USER
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        transaction.setUser(user);

        return repository.save(transaction);
    }

    // ✅ ONLY USER'S TRANSACTIONS
    @Override
    public List<Transaction> getAllTransactions() {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return repository.findByUser(user);
    }

    @Override
    public List<Transaction> getTransactionsByDate(LocalDate date) {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return repository.findByUserAndDate(user, date);
    }

    @Override
    public List<Transaction> getTransactionsByCategory(String category) {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return repository.findByUserAndCategory(user, category);
    }

    @Override
    public void deleteTransaction(Long id) {
        repository.deleteById(id);
    }
}