#!/bin/bash

input_dir="./examples/graphql"
output_dir="./examples/pg-schema"

mkdir -p "$output_dir"

for file_path in "$input_dir"/*.graphql; do
    base_name=$(basename "$file_path" .graphql)
    output_file="$output_dir/$base_name.pgs"
    npm run start -- convert -i "$file_path" | tail -n +6 > "$output_file"
done