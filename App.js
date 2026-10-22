
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  StatusBar,
} from 'react-native';

// Categories available in the application
const CATEGORIES = [
  'Food',
  'Travel',
  'Shopping',
  'Bills',
  'Salary',
  'Other',
];

// --------------------------------------------------
// WIDGET 1: SummaryCard
// Displays balance, income and expenses
// --------------------------------------------------
function SummaryCard({ balance, income, expense }) {
  const formatAmount = (amount) =>
    '\u20B9' + amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>TOTAL BALANCE</Text>
      <Text style={styles.balance}>
        {formatAmount(balance)}
      </Text>

      <View style={styles.summaryRow}>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Income</Text>
          <Text style={styles.incomeText}>
            + {formatAmount(income)}
          </Text>
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Expenses</Text>
          <Text style={styles.expenseText}>
            - {formatAmount(expense)}
          </Text>
        </View>
      </View>
    </View>
  );
}

// --------------------------------------------------
// WIDGET 2: CategoryChip
// Selectable category button
// --------------------------------------------------
function CategoryChip({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selected && styles.selectedChip,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.categoryText,
          selected && styles.selectedCategoryText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// --------------------------------------------------
// WIDGET 3: AddForm
// Collects and validates transaction details
// --------------------------------------------------
function AddForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('Expense');
  const [category, setCategory] = useState('Food');

  const handleSubmit = () => {
    const cleanTitle = title.trim();
    const numericAmount = Number(amount);

    if (
      cleanTitle.length === 0 ||
      amount.trim() === '' ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      Alert.alert(
        'Invalid input',
        'Please enter a title and a valid positive amount.'
      );
      return;
    }

    onAdd({
      title: cleanTitle,
      amount: numericAmount,
      type,
      category,
    });

    // Reset form after successful submission
    setTitle('');
    setAmount('');
    setType('Expense');
    setCategory('Food');
  };

  return (
    <View style={styles.formCard}>
      <Text style={styles.sectionTitle}>
        Add Transaction
      </Text>

      <Text style={styles.inputLabel}>Transaction Type</Text>

      <View style={styles.typeRow}>
        {['Income', 'Expense'].map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.typeButton,
              type === item &&
                (item === 'Income'
                  ? styles.incomeSelected
                  : styles.expenseSelected),
            ]}
            onPress={() => {
              setType(item);

              // Choose a sensible default category
              setCategory(item === 'Income' ? 'Salary' : 'Food');
            }}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.typeButtonText,
                type === item && styles.activeTypeText,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.inputLabel}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Salary or Lunch"
        placeholderTextColor="#94A3B8"
        value={title}
        onChangeText={setTitle}
        maxLength={60}
      />

      <Text style={styles.inputLabel}>Amount (₹)</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter amount"
        placeholderTextColor="#94A3B8"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
      />

      <Text style={styles.inputLabel}>Category</Text>
      <View style={styles.categoryRow}>
        {CATEGORIES.filter((item) =>
          type === 'Income'
            ? ['Salary', 'Other'].includes(item)
            : item !== 'Salary'
        ).map((item) => (
          <CategoryChip
            key={item}
            label={item}
            selected={category === item}
            onPress={() => setCategory(item)}
          />
        ))}
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={handleSubmit}
        activeOpacity={0.8}
      >
        <Text style={styles.addButtonText}>
          + Add Transaction
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// --------------------------------------------------
// WIDGET 4: TransactionItem
// Displays a transaction and its delete button
// --------------------------------------------------
function TransactionItem({ item, onDelete }) {
  const isIncome = item.type === 'Income';

  return (
    <View style={styles.transactionItem}>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionTitle}>
          {item.title}
        </Text>

        <Text style={styles.transactionMeta}>
          {item.category} · {item.type}
        </Text>
      </View>

      <Text
        style={[
          styles.transactionAmount,
          isIncome ? styles.incomeText : styles.expenseText,
        ]}
      >
        {isIncome ? '+' : '-'}₹
        {item.amount.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </Text>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() =>
          Alert.alert(
            'Delete transaction',
            `Delete "${item.title}"?`,
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => onDelete(item.id),
              },
            ]
          )
        }
        accessibilityLabel={`Delete ${item.title}`}
      >
        <Text style={styles.deleteText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

// --------------------------------------------------
// ROOT WIDGET: App
// Maintains state and connects all components
// --------------------------------------------------
export default function App() {
  const [transactions, setTransactions] = useState([]);

  const totalIncome = transactions
    .filter((item) => item.type === 'Income')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpense = transactions
    .filter((item) => item.type === 'Expense')
    .reduce((sum, item) => sum + item.amount, 0);

  const balance = totalIncome - totalExpense;

  const addTransaction = (transaction) => {
    setTransactions((previous) => [
      {
        ...transaction,
        id: `${Date.now()}-${Math.random()}`,
      },
      ...previous,
    ]);
  };

  const deleteTransaction = (id) => {
    setTransactions((previous) =>
      previous.filter((item) => item.id !== id)
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F4F7FB"
      />

      <View style={styles.appHeader}>
        <Text style={styles.appTitle}>Expense Manager</Text>
        <Text style={styles.appSubtitle}>
          Track your money, your way.
        </Text>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <SummaryCard
              balance={balance}
              income={totalIncome}
              expense={totalExpense}
            />

            <AddForm onAdd={addTransaction} />

            <Text style={styles.historyTitle}>
              Recent Transactions
            </Text>
          </>
        }
        renderItem={({ item }) => (
          <TransactionItem
            item={item}
            onDelete={deleteTransaction}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🧾</Text>
            <Text style={styles.emptyTitle}>
              No transactions yet.
            </Text>
            <Text style={styles.emptySubtitle}>
              Add your first income or expense above.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// STYLESHEET: Layout and visual appearance
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },
  appHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
  },
  appTitle: {
    fontSize: 27,
    fontWeight: '800',
    color: '#172554',
  },
  appSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    flexGrow: 1,
  },
  summaryCard: {
    backgroundColor: '#172554',
    borderRadius: 20,
    padding: 22,
    marginBottom: 18,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CBD5E1',
    letterSpacing: 0.8,
  },
  balance: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 22,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: '#263761',
    padding: 12,
    borderRadius: 12,
  },
  incomeText: {
    color: '#16A34A',
    fontWeight: '700',
  },
  expenseText: {
    color: '#DC2626',
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#172554',
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  incomeSelected: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
  },
  expenseSelected: {
    backgroundColor: '#FEE2E2',
    borderColor: '#DC2626',
  },
  typeButtonText: {
    color: '#475569',
    fontWeight: '700',
  },
  activeTypeText: {
    color: '#172554',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  selectedChip: {
    backgroundColor: '#DBEAFE',
    borderColor: '#2563EB',
  },
  categoryText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },
  selectedCategoryText: {
    color: '#1D4ED8',
  },
  addButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 22,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  historyTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#172554',
    marginBottom: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  transactionDetails: {
    flex: 1,
    marginRight: 8,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#172554',
  },
  transactionMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 5,
  },
  transactionAmount: {
    fontSize: 13,
    fontWeight: '800',
  },
  deleteButton: {
    width: 30,
    height: 30,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    color: '#DC2626',
    fontWeight: '800',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 12,
  },
  emptyIcon: {
    fontSize: 34,
    marginBottom: 8,
  },
  emptyTitle: {
    color: '#334155',
    fontSize: 15,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
  },
});
