# Pack 182 Mums Products - Fall Fundraiser

## Product List for Google Sheets

Copy this data into your Google Sheets "Products" tab:

### Products Table Structure
| ID | Title | Price | Image URL | Available | Description |
|---|---|---|---|---|---|
| MUM001 | 9" Pot - Yellow | 10 | https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=400 | TRUE | Beautiful yellow chrysanthemum in 9-inch pot |
| MUM002 | 9" Pot - Orange | 10 | https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=400 | TRUE | Vibrant orange chrysanthemum in 9-inch pot |
| MUM003 | 9" Pot - Red | 10 | https://images.unsplash.com/photo-1615559337337-e68c4d353851?w=400 | TRUE | Stunning red chrysanthemum in 9-inch pot |
| MUM004 | 9" Pot - Purple | 10 | https://images.unsplash.com/photo-1602928321679-560bb453f190?w=400 | TRUE | Rich purple chrysanthemum in 9-inch pot |
| MUM005 | 9" Pot - White | 10 | https://images.unsplash.com/photo-1574263867128-a3d9c152226e?w=400 | TRUE | Elegant white chrysanthemum in 9-inch pot |
| HANG001 | 10" Hanging Basket - Yellow | 15 | https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=400 | TRUE | Yellow mums in 10-inch hanging basket |
| HANG002 | 10" Hanging Basket - Orange | 15 | https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=400 | TRUE | Orange mums in 10-inch hanging basket |
| HANG003 | 10" Hanging Basket - Red | 15 | https://images.unsplash.com/photo-1615559337337-e68c4d353851?w=400 | TRUE | Red mums in 10-inch hanging basket |
| HANG004 | 10" Hanging Basket - Purple | 15 | https://images.unsplash.com/photo-1602928321679-560bb453f190?w=400 | TRUE | Purple mums in 10-inch hanging basket |
| HANG005 | 10" Hanging Basket - White | 15 | https://images.unsplash.com/photo-1574263867128-a3d9c152226e?w=400 | TRUE | White mums in 10-inch hanging basket |
| DECK001 | 10" Deck Planter - Yellow | 15 | https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=400 | TRUE | Yellow mums in 10-inch deck planter |
| DECK002 | 10" Deck Planter - Orange | 15 | https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=400 | TRUE | Orange mums in 10-inch deck planter |
| DECK003 | 10" Deck Planter - Red | 15 | https://images.unsplash.com/photo-1615559337337-e68c4d353851?w=400 | TRUE | Red mums in 10-inch deck planter |
| DECK004 | 10" Deck Planter - Purple | 15 | https://images.unsplash.com/photo-1602928321679-560bb453f190?w=400 | TRUE | Purple mums in 10-inch deck planter |
| DECK005 | 10" Deck Planter - White | 15 | https://images.unsplash.com/photo-1574263867128-a3d9c152226e?w=400 | TRUE | White mums in 10-inch deck planter |
| LARGE001 | 14" Deck Planter - Yellow | 25 | https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=400 | TRUE | Large yellow mums in 14-inch deck planter |
| LARGE002 | 14" Deck Planter - Orange | 25 | https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=400 | TRUE | Large orange mums in 14-inch deck planter |
| LARGE003 | 14" Deck Planter - Red | 25 | https://images.unsplash.com/photo-1615559337337-e68c4d353851?w=400 | TRUE | Large red mums in 14-inch deck planter |
| LARGE004 | 14" Deck Planter - Purple | 25 | https://images.unsplash.com/photo-1602928321679-560bb453f190?w=400 | TRUE | Large purple mums in 14-inch deck planter |
| LARGE005 | 14" Deck Planter - White | 25 | https://images.unsplash.com/photo-1574263867128-a3d9c152226e?w=400 | TRUE | Large white mums in 14-inch deck planter |
| APPLE001 | Apple Basket Bushel - Yellow | 35 | https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=400 | TRUE | Abundant yellow mums in apple basket bushel |
| APPLE002 | Apple Basket Bushel - Orange | 35 | https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=400 | TRUE | Abundant orange mums in apple basket bushel |
| APPLE003 | Apple Basket Bushel - Red | 35 | https://images.unsplash.com/photo-1615559337337-e68c4d353851?w=400 | TRUE | Abundant red mums in apple basket bushel |

## How to Update Google Sheets

1. Open your Google Sheet (ID: 1ifHz-wXFuHbJnIIRPyDuhg8L17cUzKgMXRgJqrL6ZCk)
2. Go to the "Products" tab
3. Clear all existing data except the header row
4. Copy and paste the data above (without the markdown table formatting)
5. Make sure the columns match: ID, Title, Price, Image URL, Available, Description

## Settings to Update

In the "Settings" tab, update these values:

| Key | Value |
|---|---|
| welcome_title | Pack 182 Fall Mums Fundraiser |
| welcome_message | Support our Cub Scouts Pack 182 by purchasing beautiful fall mums! All proceeds go directly to pack activities, camping trips, and scout programs. |
| instructions | 1. Select your mums from our catalog (5 colors available)<br>2. Choose your pot size and style<br>3. Fill out the order form<br>4. Submit your order<br>5. Pay via Venmo using the QR code<br>6. Pick up your mums on the scheduled date |
| admin_email | pack182tech@gmail.com |
| venmo_handle | @Pack182Tech |
| payment_instructions | Please include your Order ID and Scout Name in the Venmo payment description |
| pickup_location | TBD - Will be announced via email |
| pickup_date | Saturday, Date TBD, 9am-2pm |

## Note on MCP Integration

Currently, you need to manually update the Google Sheets with this data. MCP (Model Context Protocol) integration would require:

1. **MCP Server Setup**: Install an MCP server that can interact with Google Sheets API
2. **Authentication**: Set up OAuth2 for Google Sheets access
3. **Claude Desktop Configuration**: Configure Claude Desktop to use the MCP server

For now, manual updates are the simplest approach. Copy the data above into your Google Sheet to have the real products available on your site.