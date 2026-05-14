from PIL import Image
from collections import Counter

image = Image.open('public/images/nupat-cloud-logo-whitebg.jpeg').convert('RGB')
pixels = list(image.getdata())

# Define color clusters
navy = []
orange = []
cyan = []

for p in pixels:
    # Filter white and black
    if p[0] > 240 and p[1] > 240 and p[2] > 240: continue
    if p[0] < 15 and p[1] < 15 and p[2] < 15: continue
    
    if p[0] > p[2] and p[1] > 100 and p[2] < 100: # Orange
        orange.append(p)
    elif p[2] > p[0] and p[1] > 100: # Cyan
        cyan.append(p)
    elif p[2] > p[0] and p[1] < 50: # Navy
        navy.append(p)

def print_most_common(name, group):
    if not group: return
    c = Counter(group).most_common(1)[0][0]
    hex_c = '#{:02x}{:02x}{:02x}'.format(c[0], c[1], c[2])
    print(f"{name}: {hex_c} RGB: {c}")

print_most_common("Navy", navy)
print_most_common("Orange", orange)
print_most_common("Cyan", cyan)
