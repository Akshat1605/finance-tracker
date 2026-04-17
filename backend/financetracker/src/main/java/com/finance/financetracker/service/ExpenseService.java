package com.finance.financetracker.service;

import com.finance.financetracker.model.Expense;
import com.finance.financetracker.model.User;
import com.finance.financetracker.repository.ExpenseRepository;
import com.finance.financetracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    public Expense addExpense(Long userId, Expense expense) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        expense.setUser(user);

        return expenseRepository.save(expense);
    }

    public List<Expense> getExpenses(Long userId) {
        return expenseRepository.findByUser_Id(userId);
    }
}