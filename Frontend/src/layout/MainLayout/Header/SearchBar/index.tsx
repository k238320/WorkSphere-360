// SearchBar.js
import React, { useState } from 'react';
import {
    Box,
    TextField,
    List,
    ListItem,
    ListItemText,
    Typography,
    InputAdornment,
    Paper
} from '@mui/material';
import { IconSearch } from '@tabler/icons';

const SearchBar = () => {
    // Sample user data
    const users = [
        { id: 1, name: 'Alice', status: 'active' },
        { id: 2, name: 'Bob', status: 'offline' },
        { id: 3, name: 'Charlie', status: 'active' },
        { id: 4, name: 'Diana', status: 'offline' },
        { id: 5, name: 'Eve', status: 'active' },
        { id: 6, name: 'Frank', status: 'offline' },
        { id: 7, name: 'Grace', status: 'active' },
    ];

    // State for search input
    const [searchInput, setSearchInput] = useState('');

    // Filter users based on the search input
    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(searchInput.toLowerCase())
    );

    return (
        <Box sx={{ position: 'relative', minWidth: '250px' }}>
            {/* Search input */}
            <TextField
                fullWidth
                placeholder="Search users..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <IconSearch />
                        </InputAdornment>
                    )
                }}
                variant="outlined"
                size="small"
            />
            {/* Filtered user list */}
            {searchInput && (
                <Paper
                    elevation={3}
                    sx={{
                        position: 'absolute',
                        top: '42px',
                        left: 0,
                        right: 0,
                        maxHeight: '200px', // Limit height and enable scroll
                        overflowY: 'auto',
                        zIndex: 10,
                        borderRadius: '8px',
                        mt: 1,
                    }}
                >
                    <List dense>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <ListItem key={user.id} sx={{ py: 0 }}>
                                    <ListItemText
                                        primary={user.name}
                                        secondary={
                                            <Typography
                                                variant="caption"
                                                color={user.status === 'active' ? 'green' : 'red'}
                                            >
                                                {user.status}
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                            ))
                        ) : (
                            <Typography
                                variant="body2"
                                color="textSecondary"
                                align="center"
                                sx={{ p: 1 }}
                            >
                                No users found.
                            </Typography>
                        )}
                    </List>
                </Paper>
            )}
        </Box>
    );
};

export default SearchBar;
