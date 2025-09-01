# Update Google Sheets with New Image URLs

## Quick Update Instructions

The website now uses local images from the `pics/` directory. You need to update the Google Sheets to match.

### Option 1: Manual Update
1. Go to: https://docs.google.com/spreadsheets/d/1ifHz-wXFuHbJnIIRPyDuhg8L17cUzKgMXRgJqrL6ZCk/edit
2. Go to the **Products** tab
3. Update the Image URL column (column D) with these values:

| Row | Product | New Image URL |
|-----|---------|---------------|
| 2 | 9" Pot Mum Bundle | `pics/9.png` |
| 3 | 10" Hanging Basket | `pics/Hanging Basket.png` |
| 4 | 10" Deck Planter | `pics/10.png` |
| 5 | 14" Deck Planter | `pics/14.png` |
| 6 | Apple Basket | `pics/Apple Basket.png` |

### Option 2: Copy & Paste
Copy this entire block and paste it into cells A1:F6 in the Products sheet:

```
ID	Title	Price	Image URL	Available	Description
POT9	9" Pot Mum Bundle	10	pics/9.png	TRUE	Beautiful 9-inch potted chrysanthemum - Choose your color: Yellow/Orange/Red/Purple/White
HANG10	10" Hanging Basket Bundle	15	pics/Hanging Basket.png	TRUE	Gorgeous hanging basket with cascading mums - Choose your color: Yellow/Orange/Red/Purple/White
DECK10	10" Deck Planter Bundle	15	pics/10.png	TRUE	Decorative deck planter filled with mums - Choose your color: Yellow/Orange/Red/Purple/White
DECK14	14" Deck Planter Bundle	25	pics/14.png	TRUE	Large deck planter overflowing with mums - Choose your color: Yellow/Orange/Red/Purple/White
APPLE	Apple Basket Bushel Bundle	35	pics/Apple Basket.png	TRUE	Abundant apple basket filled with mums - Choose your color: Yellow/Orange/Red only
```

### Option 3: Run the automated script
```bash
cd automation
node manual-deploy.js sheets
```
This will open the spreadsheet and copy the data to your clipboard for easy pasting.

## Important Note
The images are now hosted directly on GitHub Pages, so they'll load much faster and more reliably than external URLs. The actual image files are in the `pics/` directory of your repository.