#!/usr/bin/env python3
"""
Script to analyze the Parquet file and understand what years of data are available.
"""
import pandas as pd
import sys
from pathlib import Path

def analyze_parquet_file(file_path):
    """Analyze the Parquet file to understand the date range and data structure."""
    try:
        print(f"Analyzing Parquet file: {file_path}")
        
        # Read the Parquet file
        df = pd.read_parquet(file_path)
        
        print(f"\n📊 Basic Information:")
        print(f"   Total records: {len(df):,}")
        print(f"   Columns: {len(df.columns)}")
        print(f"   File size: {Path(file_path).stat().st_size / 1024 / 1024:.1f} MB")
        
        print(f"\n📅 Column Information:")
        for col in df.columns:
            print(f"   - {col}: {df[col].dtype}")
        
        # Analyze datetime column
        if 'datetime' in df.columns:
            print(f"\n🕒 Datetime Analysis:")
            
            # Convert to datetime if needed
            df['datetime'] = pd.to_datetime(df['datetime'])
            
            # Get date range
            min_date = df['datetime'].min()
            max_date = df['datetime'].max()
            
            print(f"   Date range: {min_date} to {max_date}")
            print(f"   Duration: {(max_date - min_date).days} days")
            
            # Extract years and analyze
            df['year'] = df['datetime'].dt.year
            year_counts = df['year'].value_counts().sort_index()
            
            print(f"\n📈 Records by Year:")
            for year, count in year_counts.items():
                percentage = (count / len(df)) * 100
                print(f"   {year}: {count:,} records ({percentage:.1f}%)")
            
            # Check for 2025 data specifically
            data_2025 = df[df['year'] == 2025]
            if len(data_2025) > 0:
                print(f"\n✅ 2025 Data Found:")
                print(f"   Records: {len(data_2025):,}")
                print(f"   Date range: {data_2025['datetime'].min()} to {data_2025['datetime'].max()}")
                
                # Show monthly distribution for 2025
                data_2025['month'] = data_2025['datetime'].dt.month
                monthly_counts = data_2025['month'].value_counts().sort_index()
                print(f"   Monthly distribution in 2025:")
                for month, count in monthly_counts.items():
                    print(f"     Month {month}: {count:,} records")
            else:
                print(f"\n❌ No 2025 Data Found")
                print(f"   Expected based on filename: african_cities_air_quality_2024_2026.parquet")
                print(f"   Actual years available: {sorted(year_counts.index.tolist())}")
            
            # Monthly distribution for all data
            df['month'] = df['datetime'].dt.month
            df['year_month'] = df['datetime'].dt.to_period('M')
            
            print(f"\n📊 Monthly Distribution (All Years):")
            monthly_dist = df['year_month'].value_counts().sort_index()
            print(f"   Showing first 10 and last 10 months:")
            
            # First 10
            for period, count in monthly_dist.head(10).items():
                print(f"   {period}: {count:,} records")
            
            if len(monthly_dist) > 20:
                print("   ...")
            
            # Last 10
            for period, count in monthly_dist.tail(10).items():
                print(f"   {period}: {count:,} records")
        
        # Analyze cities and stations
        if 'city' in df.columns:
            print(f"\n🌆 Cities Analysis:")
            city_counts = df['city'].value_counts()
            print(f"   Total cities: {len(city_counts)}")
            for city, count in city_counts.head(10).items():
                print(f"   {city}: {count:,} records")
        
        if 'station_id' in df.columns:
            print(f"\n📡 Stations Analysis:")
            station_counts = df['station_id'].value_counts()
            print(f"   Total stations: {len(station_counts)}")
            for station, count in station_counts.head(10).items():
                print(f"   {station}: {count:,} records")
        
        # Sample data from different years
        print(f"\n🔍 Sample Data:")
        available_years = sorted(df['year'].unique())
        for year in available_years[:3]:  # Show first 3 years
            year_sample = df[df['year'] == year].head(2)
            print(f"\n   Sample from {year}:")
            for idx, row in year_sample.iterrows():
                print(f"     {row['datetime']} | {row.get('city', 'N/A')} | {row.get('station_id', 'N/A')} | AQI: {row.get('overall_aqi', 'N/A')}")
        
        return df
        
    except Exception as e:
        print(f"❌ Error analyzing Parquet file: {e}")
        import traceback
        traceback.print_exc()
        return None

def main():
    parquet_file = "/Users/yharby/Documents/gl/cartologic-projects/cedare-airquality/aaqis-app/static/data/african_cities_air_quality_2024_2026.parquet"
    
    if not Path(parquet_file).exists():
        print(f"❌ Parquet file not found: {parquet_file}")
        sys.exit(1)
    
    df = analyze_parquet_file(parquet_file)
    
    if df is not None:
        print(f"\n✅ Analysis completed successfully!")
        print(f"\n🎯 Key Findings:")
        print(f"   - File contains {len(df):,} total records")
        
        if 'datetime' in df.columns:
            years = sorted(df['datetime'].dt.year.unique())
            print(f"   - Years available: {years}")
            
            current_year = 2025  # Current year based on the question
            if current_year in years:
                current_year_data = df[df['datetime'].dt.year == current_year]
                print(f"   - {current_year} data: {len(current_year_data):,} records")
            else:
                print(f"   - No {current_year} data found (expected issue)")
                print(f"   - Most recent year: {max(years) if years else 'N/A'}")
        
        print(f"\n💡 This analysis should help identify why the Year-to-Date heatmap might be showing incorrect years.")

if __name__ == "__main__":
    main()