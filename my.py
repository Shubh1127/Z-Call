import matplotlib.pyplot as plt

def line_bres(xa, ya, xb, yb):
    pts = []

    dx = abs(xb - xa)
    dy = abs(yb - ya) 

    step_x = 1 if xb > xa else -1
    step_y = 1 if yb > ya else -1

    error = dx - dy

    while True:
        pts.append((xa, ya))

        if xa == xb and ya == yb:
            break

        temp = 2 * error

        if temp > -dy:
            error -= dy
            xa += step_x

        if temp < dx:
            error += dx
            ya += step_y

    return pts


def plot_line(xa, ya, xb, yb):
    result = line_bres(xa, ya, xb, yb)

    x = [i[0] for i in result]
    y = [i[1] for i in result]

    plt.scatter(x, y, color="black")
    plt.plot(x, y, color="green")

    plt.axis("equal")
    plt.grid(True)
    plt.show()


plot_line(1, 2, 9, 6)
print("Done by Shubham")


