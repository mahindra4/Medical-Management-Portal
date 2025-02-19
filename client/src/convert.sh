#!/bin/bash

# Directory containing JSX files (change this to your source directory)
SOURCE_DIR="$(pwd)/client/src/pages"

# Function to convert a single file
convert_file() {
    input_file="$1"
    output_file="${input_file%.jsx}.js"
    
    echo "Converting $input_file to $output_file"
    npx babel "$input_file" --out-file "$output_file" --presets=@babel/preset-react --no-babelrc
}

# Function to process directory recursively
process_directory() {
    local dir="$1"
    for file in "$dir"/*; do
        if [ -d "$file" ]; then
            process_directory "$file"
        elif [ "${file##*.}" = "jsx" ]; then
            convert_file "$file"
        fi
    done
}

# Check if Babel CLI is installed
if ! command -v npx babel &> /dev/null; then
    echo "Babel CLI is not installed. Installing..."
    npm install -g @babel/cli @babel/core @babel/preset-react
fi

# Start processing
process_directory "$SOURCE_DIR"

echo "Conversion complete!"
