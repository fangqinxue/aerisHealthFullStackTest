t = int(input('please input here'))

for _ in range(t):
    n = int(input())

    if n % 2 == 1 or n < 4:
        print(-1)
        continue

    mn = (n + 5) // 6

    if n % 4 == 0:
        mx = n // 4
    else:
        mx = n // 4 - 1

    if mn > mx:
        print(-1)
    else:
        print(mn, mx)