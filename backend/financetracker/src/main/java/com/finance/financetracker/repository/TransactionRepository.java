package com.finance.financetracker.repository;

import com.finance.financetracker.model.Transaction;
import com.finance.financetracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction,Long> {
    List<Transaction> findByUserAndDate(User user, LocalDate date);

    List<Transaction> findByUserAndCategory(User user, String category);

    List<Transaction> findByUser(User user);
}
