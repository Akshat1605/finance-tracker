package com.finance.financetracker.controller;

import com.finance.financetracker.model.Expense;
import com.finance.financetracker.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping("/{userId}")
    public ResponseEntity<Expense> addExpense(
            @PathVariable Long userId,
            @RequestBody Expense expense) {

        return ResponseEntity.ok(expenseService.addExpense(userId, expense));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<Expense>> getExpenses(
            @PathVariable Long userId) {

        return ResponseEntity.ok(expenseService.getExpenses(userId));
    }
}