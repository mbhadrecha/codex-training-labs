numbers = [3, 8, 12, 5, 20]
threshold = 10
total = 0

for idx in range(len(numbers)):
    value = numbers[idx]
    if value >= threshold:
        total += value

print("Filtered sum:")
print(total)
